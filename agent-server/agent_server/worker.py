from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv(), override=True)

from agent_server.telemetry import init_telemetry

init_telemetry()

import asyncio
import os
from datetime import datetime
from typing import AsyncIterator, Dict

from agent_graph.code_mock_staged_v1.constants import AgentConfig
from agent_graph.code_mock_staged_v1.graph import AgentState, create_graph
from agent_graph.state_merger import StateMerger
from agent_server.agent_streams import AgentStream
from agent_server.agent_triggers import AgentTrigger
from agent_server.contexts.context_manager import AgentContextManager
from agent_server.contexts.session import CodeSession
from agent_server.events.events import (
    CodeEditorChangedEvent,
    GroundTruthTestcaseExecutedEvent,
    ReminderEvent,
    TestcaseChangedEvent,
    UserMessageEvent,
    UserTestcaseExecutedEvent,
)
from agent_server.livekit.streams import EchoStream, NoopLLM, NoopStream
from agent_server.livekit.tts import get_tts_engine
from agent_server.utils.logger import get_logger
from agent_server.utils.messages import livekit_to_langchain_message
from livekit.agents import cli  # type: ignore
from livekit.agents import JobContext, JobProcess, WorkerOptions, llm
from livekit.agents.llm import ChatMessage
from livekit.agents.pipeline.pipeline_agent import VoicePipelineAgent
from livekit.plugins import deepgram, silero
from livekit.rtc import DataPacket

from libs.convex.api import ConvexApi
from libs.message_wrapper import MessageWrapper

logger = get_logger(__name__)


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load(min_speech_duration=0.2)


async def entrypoint(ctx: JobContext):
    AGENT_NAME = "code-mock-staged-v1"

    logger.info(f"Convex URL: {os.environ['CONVEX_URL']}")

    no_op_llm = NoopLLM()
    convex_api = ConvexApi(convex_url=os.getenv("CONVEX_URL") or "")

    # Initialize session
    session = CodeSession(api=convex_api)
    # Initialize state merger
    state_merger = StateMerger.from_state(name=AGENT_NAME, state_type=AgentState)
    # Queue for processing adhoc state snapshots updates
    state_update_q = asyncio.Queue[Dict]()
    # Queue for sending active user message events when agent is triggered by VAD -> STT
    user_message_event_q = asyncio.Queue[MessageWrapper]()
    # Queue for sending user message response from agent stream
    user_message_response_q = asyncio.Queue[AsyncIterator[str] | None]()
    # Unix timestamp for generating unique message ids
    unix_timestamp = int(datetime.now().timestamp())

    # Initialize context manager and start, which will initialize the code session
    ctx_manager: AgentContextManager = AgentContextManager(
        ctx=ctx,
        api=convex_api,
        state_type=AgentState,
        session=session,
        agent_state_emitter=state_merger,
    )
    await ctx_manager.start()

    async def before_llm_callback(_: VoicePipelineAgent, chat_ctx: llm.ChatContext):
        """This callback is executed before the LLM is called. In the actual implementation,
        we use this callback to override the default behavior of LLM since we are using the customized
        Event Based Agent.

        Args:
            _ (VoicePipelineAgent): The voice assistant instance
            chat_ctx (llm.ChatContext): The chat context

        Returns:
            EchoStream: The stream to be used for the LLM response
        """
        lc_messages = livekit_to_langchain_message(chat_ctx, unix_timestamp)

        # Put the messages into the message event queue so that UserMessageEvent can pick it up
        user_message_event_q.put_nowait(MessageWrapper.from_messages(lc_messages))
        # Get the text stream from the message response queue so that we can return it to the voice assistant
        text_stream = await user_message_response_q.get()

        if text_stream is not None:
            return EchoStream.from_chat_ctx(text_stream=text_stream, chat_ctx=chat_ctx)
        else:
            return NoopStream.from_chat_ctx(chat_ctx=chat_ctx)

    assistant = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=no_op_llm,
        tts=get_tts_engine(session.session_metadata.voice),
        before_llm_cb=before_llm_callback,
        # turn_detector=turn_detector.EOUModel(unlikely_threshold=0.05),
    )

    # @assistant.on("metrics_collected")
    # def on_metrics_collected(metrics):
    #     logger.info(f"[metrics_collected] {metrics}")

    logger.info(f"Model name: {session.session_metadata.model_name}")

    agent_config = AgentConfig(
        # fast_model="deepseek-chat",
        smart_model=session.session_metadata.model_name,
        convex_url=convex_api.convex_url,
        stages=session.session_metadata.interview_flow,  # type: ignore
        transition_confirmation_enabled=True,
    )

    agent_stream = AgentStream(
        name=AGENT_NAME,
        state_cls=AgentState,
        global_session_ts=unix_timestamp,
        config=agent_config,
        session=session,
        graph=create_graph(),
        assistant=assistant,
        message_q=user_message_response_q,
        state_merger=state_merger,
    )

    agent_trigger = AgentTrigger(
        assistant=assistant,
        stream=agent_stream,
        state_update_q=state_update_q,
        events=[
            ReminderEvent(assistant=assistant, delay=90),
            CodeEditorChangedEvent(session=session, assistant=assistant),
            UserTestcaseExecutedEvent(session=session),
            GroundTruthTestcaseExecutedEvent(session=session, convex_api=convex_api),
            UserMessageEvent(user_message_event_q=user_message_event_q),
            TestcaseChangedEvent(session=session),
            # StepTrackingEvent(
            #     state_merger=state_merger,
            #     agent_config=agent_config,
            #     state_update_q=state_update_q,
            # ),
        ],
    )

    # [IMPORTANT] The order of starting the agent trigger and the assistant is important.
    # The agent trigger needs to start before the assistant so it setup the event listeners
    # for any events requiring assistant as a dependency. Otherwise, some of the events from
    # assistant might not be captured properly.

    agent_trigger.start()
    assistant.start(ctx.room)

    ####################### Dev only #######################

    @ctx.room.on("data_received")
    def handle_data_received(data: DataPacket):
        if data.topic != "chat-message":
            return

        message = data.data.decode("utf-8")
        logger.info(f"[chat-message] {message}")

        assistant.chat_ctx.messages.append(ChatMessage(role="user", content=message))
        lc_messages = livekit_to_langchain_message(assistant.chat_ctx, unix_timestamp)
        agent_trigger.add_user_message(lc_messages)

    ####################### Dev only #######################

    await agent_trigger.trigger()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            prewarm_fnc=prewarm,
            entrypoint_fnc=entrypoint,
            host="0.0.0.0",
            port=8081,
            # load_fnc=CustomLoadCalc.get_load,
            # load_threshold=0.80,  # max(cpu_load, mem_load)
            shutdown_process_timeout=10,  # seconds
        )
    )
