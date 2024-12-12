import asyncio
import hashlib
import logging
import os
from datetime import datetime
from typing import AsyncIterator, Dict

import psutil
from agent_graph.code_mock_staged_v1.constants import AgentConfig, get_step_map
from agent_graph.code_mock_staged_v1.graph import AgentState, create_graph
from agent_graph.state_merger import StateMerger
from agent_graph.storages.langgraph_cloud import LangGraphCloudStateStorage
from agent_server.agent_streams import AgentStream
from agent_server.agent_triggers import AgentTrigger
from agent_server.contexts.context_manager import AgentContextManager
from agent_server.contexts.session import CodeSession
from agent_server.events.events import (
    CodeEditorChangedEvent,
    GroundTruthTestcaseExecutedEvent,
    ReminderEvent,
    StepTrackingEvent,
    TestcaseChangedEvent,
    UserMessageEvent,
    UserTestcaseExecutedEvent,
)
from agent_server.livekit.streams import EchoStream, NoopLLM, NoopStream
from agent_server.livekit.tts import create_elevenlabs_tts, get_tts_engine
from agent_server.utils.logger import get_logger
from agent_server.utils.messages import (
    convert_chat_ctx_to_langchain_messages,
    filter_langchain_messages,
    livekit_to_langchain_message,
)
from dotenv import find_dotenv, load_dotenv
from livekit.agents import cli  # type: ignore
from livekit.agents import JobContext, WorkerOptions, llm, utils
from livekit.agents.llm import ChatMessage
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents.worker import Worker, _DefaultLoadCalc
from livekit.plugins import deepgram, openai, silero
from livekit.rtc import DataPacket

from libs.convex.api import ConvexApi
from libs.message_wrapper import MessageWrapper

logging.getLogger("openai._base_client").setLevel(logging.INFO)
logger = get_logger(__name__)

load_dotenv(find_dotenv())

AGENT_NAME = "code-mock-staged-v1"


class CustomLoadCalc(_DefaultLoadCalc):
    """CustomLoadCalc is a custom load calculator that extends the default load calculator.

    It calculates the load based on the CPU and memory usage.
    """

    def __init__(self) -> None:
        super().__init__()
        self._mem_avg = utils.MovingAverage(5)  # avg over 2.5 seconds, like CPU

    def _calc_load(self) -> None:
        while True:
            cpu_p = psutil.cpu_percent(0.5) / 100.0  # 2 samples/s
            mem_p = psutil.virtual_memory().percent / 100.0

            with self._lock:
                self._m_avg.add_sample(cpu_p)
                self._mem_avg.add_sample(mem_p)

    def _get_avg(self) -> float:
        with self._lock:
            cpu_load = self._m_avg.get_avg()
            mem_load = self._mem_avg.get_avg()
            return max(cpu_load, mem_load)

    @classmethod
    def get_load(cls, worker: Worker) -> float:
        """The load is the maximum of the CPU and memory usage.

        Returns:
            float: The load as a percentage.
        """
        if cls._instance is None:
            cls._instance = CustomLoadCalc()

        return cls._instance._get_avg()


async def entrypoint(ctx: JobContext):
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
        session=session,
        agent_state_emitter=state_merger,
    )
    await ctx_manager.start()

    async def before_llm_callback(_: VoiceAssistant, chat_ctx: llm.ChatContext):
        """This callback is executed before the LLM is called. In the actual implementation,
        we use this callback to override the default behavior of LLM since we are using the customized
        Event Based Agent.

        Args:
            _ (VoiceAssistant): The voice assistant instance
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
            return EchoStream(text_stream=text_stream, chat_ctx=chat_ctx)
        else:
            return NoopStream(chat_ctx=chat_ctx)

    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=no_op_llm,
        tts=get_tts_engine(session.session_metadata.voice),
        before_llm_cb=before_llm_callback,
    )

    # @assistant.on("metrics_collected")
    # def on_metrics_collected(metrics):
    #     logger.info(f"[metrics_collected] {metrics}")

    agent_config = AgentConfig(
        # fast_model="claude-3-5-haiku-latest",
        # smart_model="claude-3-5-sonnet-latest",
        convex_url=convex_api.convex_url,
        stages=session.session_metadata.interview_flow,
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
        stream=agent_stream,
        state_update_q=state_update_q,
        events=[
            ReminderEvent(assistant=assistant, delay=20),
            CodeEditorChangedEvent(session=session, assistant=assistant),
            UserTestcaseExecutedEvent(session=session),
            GroundTruthTestcaseExecutedEvent(session=session, convex_api=convex_api),
            UserMessageEvent(user_message_event_q=user_message_event_q),
            TestcaseChangedEvent(session=session),
            StepTrackingEvent(
                state_merger=state_merger,
                agent_config=agent_config,
                state_update_q=state_update_q,
            ),
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
            entrypoint_fnc=entrypoint,
            host="0.0.0.0",
            port=8081,
            # load_fnc=CustomLoadCalc.get_load,
            # load_threshold=0.80,  # max(cpu_load, mem_load)
            # shutdown_process_timeout=30,  # seconds
        )
    )
