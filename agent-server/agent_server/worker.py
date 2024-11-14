import asyncio
import hashlib
import os
import time
from datetime import datetime
from typing import AsyncIterator

import psutil
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
    UserMessageEvent,
    UserTestcaseExecutedEvent,
)
from agent_server.livekit.streams import EchoStream, NoopLLM, NoopStream
from agent_server.livekit.tts import create_elevenlabs_tts
from agent_server.storages.langgraph_cloud import LangGraphCloudStateStorage
from agent_server.utils.logger import get_logger
from agent_server.utils.messages import (
    convert_chat_ctx_to_langchain_messages,
    filter_langchain_messages,
)
from agent_server.utils.profiler import get_profiler, set_profiler_id
from dotenv import find_dotenv, load_dotenv
from livekit.agents import cli  # type: ignore
from livekit.agents import JobContext, WorkerOptions, llm, utils
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents.worker import _DefaultLoadCalc
from livekit.plugins import deepgram, openai, silero

from libs.convex.api import ConvexApi
from libs.types import MessageWrapper

logger = get_logger(__name__)
pf = get_profiler()

load_dotenv(find_dotenv())


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
    def get_load(cls) -> float:
        """The load is the maximum of the CPU and memory usage.

        Returns:
            float: The load as a percentage.
        """
        if cls._instance is None:
            cls._instance = CustomLoadCalc()

        return cls._instance._get_avg()


async def entrypoint(ctx: JobContext):
    pf.start()

    no_op_llm = NoopLLM()
    convex_api = ConvexApi(convex_url=os.getenv("CONVEX_URL") or "")
    session = CodeSession(api=convex_api)

    user_message_event_q = asyncio.Queue[MessageWrapper]()
    user_message_response_q = asyncio.Queue[AsyncIterator[str] | None]()
    unix_timestamp = int(datetime.now().timestamp())

    ctx_manager = AgentContextManager(ctx=ctx, api=convex_api, session=session)
    await ctx_manager.start()

    set_profiler_id(ctx_manager.session_id)

    async def before_llm_callback(_: VoiceAssistant, chat_ctx: llm.ChatContext):
        lc_messages = filter_langchain_messages(
            convert_chat_ctx_to_langchain_messages(chat_ctx)
        )

        for i, message in enumerate(lc_messages):
            key = f"{unix_timestamp}-{i}-{message.type}"
            message.id = hashlib.md5(key.encode()).hexdigest()

        with pf.range("before_llm_callback.user_message_q"):
            user_message_event_q.put_nowait(MessageWrapper.from_messages(lc_messages))
            text_stream = await user_message_response_q.get()

        if text_stream is not None:
            return EchoStream(text_stream=text_stream, chat_ctx=chat_ctx)
        else:
            return NoopStream(chat_ctx=chat_ctx)

    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=no_op_llm,
        tts=create_elevenlabs_tts(),
        chat_ctx=ctx_manager.chat_ctx,
        before_llm_cb=before_llm_callback,
    )

    agent_name = "code-mock-staged-v1"

    with pf.range("entrypoint.init_state_merger"):
        state_merger = await StateMerger.from_state_and_storage(
            name=agent_name,
            state_type=AgentState,
            storage=LangGraphCloudStateStorage(
                thread_id=session.session_metadata.agent_thread_id,
                assistant_id=session.session_metadata.assistant_id,
            ),
        )

    agent_stream = AgentStream(
        name=agent_name,
        state_cls=AgentState,
        config=AgentConfig(
            # fast_model="claude-3-5-haiku-latest",
            # smart_model="claude-3-5-sonnet-latest",
            convex_url=convex_api.convex_url,
        ),
        session=session,
        graph=create_graph(),
        assistant=assistant,
        message_q=user_message_response_q,
        state_merger=state_merger,
    )

    agent_trigger = AgentTrigger(
        stream=agent_stream,
        events=[
            ReminderEvent(assistant=assistant),
            CodeEditorChangedEvent(session=session, assistant=assistant),
            UserTestcaseExecutedEvent(session=session),
            GroundTruthTestcaseExecutedEvent(session=session),
            UserMessageEvent(event_q=user_message_event_q),
        ],
    )

    agent_trigger.start()
    assistant.start(ctx.room)

    with pf.range("entrypoint.agent_trigger.trigger"):
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
