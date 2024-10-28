import asyncio
import os

import psutil
from agent_server.agent import LangGraphLLM, NoOpLLMStream
from agent_server.contexts.context_manager import AgentContextManager
from agent_server.contexts.session import CodeSession
from agent_server.convex.api import ConvexApi
from agent_server.utils.logger import get_logger
from dotenv import find_dotenv, load_dotenv
from livekit.agents import cli  # type: ignore
from livekit.agents import JobContext, WorkerOptions, llm, utils
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.agents.worker import _DefaultLoadCalc
from livekit.plugins import deepgram, elevenlabs, openai, silero

logger = get_logger(__name__)

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
    agent = LangGraphLLM()
    convex_api = ConvexApi(convex_url=os.getenv("CONVEX_URL") or "")
    ctx_manager = AgentContextManager[CodeSession](ctx=ctx, api=convex_api)

    def invoke_agent(chat_ctx: llm.ChatContext, interaction_type: str) -> llm.LLMStream:
        code_session_state = ctx_manager.session.session_state
        code_session_metadata = ctx_manager.session.session_metadata

        agent.set_agent_session(code_session_metadata)
        agent.set_agent_context(code_session_state, interaction_type)
        return agent.chat(chat_ctx=chat_ctx)

    def before_llm_callback(
        assistant: VoiceAssistant, chat_ctx: llm.ChatContext
    ) -> llm.LLMStream:
        logger.info("before_llm_callback")
        # return NoOpLLMStream(chat_ctx=chat_ctx)
        return invoke_agent(chat_ctx, "response_required")

    tts = elevenlabs.TTS(
        model_id="eleven_multilingual_v2",
        voice=elevenlabs.Voice(
            id="DaWkexxdbjoJ99NpkRGF",
            name="brian-optimized",
            category="cloned",
            settings=elevenlabs.VoiceSettings(
                stability=0.3,
                similarity_boost=0.5,
                style=0.5,
                use_speaker_boost=True,
            ),
        ),
    )

    assistant = VoiceAssistant(
        vad=silero.VAD.load(),
        stt=deepgram.STT(),
        llm=agent,
        tts=tts,
        chat_ctx=ctx_manager.chat_ctx,
        preemptive_synthesis=True,
        interrupt_speech_duration=0.4,
        min_endpointing_delay=0.2,
        before_llm_cb=before_llm_callback,
    )

    await ctx_manager.start()

    assistant.start(ctx.room)

    await assistant.say(
        before_llm_callback(assistant, ctx_manager.chat_ctx),
        allow_interruptions=True,
        add_to_chat_ctx=True,
    )


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
