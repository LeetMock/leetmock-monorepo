import os
import asyncio
from typing import List
from agent_server.contexts.convex import ConvexApi
from agent_server.types import EditorSnapshot
import psutil

from dotenv import load_dotenv, find_dotenv
from convex_client.models import (
    RequestActionsGetEditorSnapshot,
    RequestSessionsEndSessionArgs,
)
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,  # type: ignore
    llm,
    utils,
)
from livekit.agents.worker import _DefaultLoadCalc
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, silero, elevenlabs, openai
from agent_server.agent import LangGraphLLM, NoOpLLMStream
from agent_server.contexts.context_manager import AgentContextManager
from agent_server.utils.logger import get_logger

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
    ctx_manager = AgentContextManager(ctx=ctx, api=convex_api)

    reminder_task: asyncio.Task | None = None
    reminder_delay = 24  # seconds
    last_message_was_reminder = False
    prevent_consecutive_reminders = True

    async def debounced_send_reminder():
        nonlocal reminder_task, last_message_was_reminder, prevent_consecutive_reminders
        if reminder_task:
            logger.info("Reminder task cancelled")
            reminder_task.cancel()
        if prevent_consecutive_reminders and last_message_was_reminder:
            logger.info(
                "Last message was a reminder. Skipping sending another reminder."
            )
            return  # Don't send another reminder if the last message was already a reminder

        async def delayed_reminder():
            nonlocal last_message_was_reminder
            await asyncio.sleep(reminder_delay)
            await send_reminder()
            if prevent_consecutive_reminders:
                last_message_was_reminder = True

        reminder_task = asyncio.create_task(delayed_reminder())

    async def send_reminder():
        logger.info(f"Reminder sent")
        await assistant.say(
            invoke_agent(assistant.chat_ctx, "reminder_required"),
            allow_interruptions=True,
            add_to_chat_ctx=True,
        )

    def invoke_agent(chat_ctx: llm.ChatContext, interaction_type: str) -> llm.LLMStream:
        request = RequestActionsGetEditorSnapshot(
            args=RequestSessionsEndSessionArgs(sessionId=ctx_manager.session_id)
        )
        response = convex_api.action.api_run_actions_get_editor_snapshot_post(request)

        if response.status == "error" or response.value is None:
            logger.error(f"Error getting snapshot: {response.error_message}")
            raise Exception(f"Error getting snapshot: {response.error_message}")

        logger.info(f"Got snapshot: {response.value}")

        agent.set_agent_context(response.value, interaction_type)
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
        tts=openai.TTS(),
        chat_ctx=ctx_manager.chat_ctx,
        interrupt_speech_duration=0.7,
        before_llm_cb=before_llm_callback,
    )

    @assistant.on("agent_speech_committed")
    def update_message_state_for_agent(msg: llm.ChatMessage):
        logger.info(f"agent_speech_committed: {msg}")

        # Send a reminder event to the agent after 10 seconds of silence since the
        # last agent speech committed
        asyncio.create_task(debounced_send_reminder())

    @assistant.on("user_speech_committed")
    def update_message_state_for_user(msg: llm.ChatMessage):
        nonlocal last_message_was_reminder, prevent_consecutive_reminders

        logger.info(f"user_speech_committed: {msg}")
        if prevent_consecutive_reminders:
            last_message_was_reminder = False  # Reset the flag when user speaks

        # Send a reminder event to the agent after 10 seconds of silence since the
        # last agent speech committed
        asyncio.create_task(debounced_send_reminder())

    @assistant.on("user_started_speaking")
    def on_user_started_speaking():
        logger.info("user_started_speaking")
        if reminder_task:
            reminder_task.cancel()

    @assistant.on("user_stopped_speaking")
    def on_user_stopped_speaking():
        logger.info("user_stopped_speaking")
        asyncio.create_task(debounced_send_reminder())

    @assistant.on("agent_started_speaking")
    def on_agent_started_speaking():
        logger.info("agent_started_speaking")
        if reminder_task:
            reminder_task.cancel()

    @assistant.on("agent_stopped_speaking")
    def on_agent_stopped_speaking():
        logger.info("agent_stopped_speaking")
        asyncio.create_task(debounced_send_reminder())

    @ctx_manager.on("snapshot_updated")
    def on_snapshot_updated(snapshots: List[EditorSnapshot]):
        logger.info(f"snapshot_updated: {len(snapshots)}")

    await ctx_manager.setup(agent)
    await ctx_manager.start()

    assistant.start(ctx.room)

    await assistant.say(
        before_llm_callback(assistant, ctx_manager.chat_ctx),
        allow_interruptions=True,
        add_to_chat_ctx=True,
    )


"""
langgraph: agent execution flow
event-driven: when to call agent

[
    Event("snapshot_updated", [EditorSnapshot])
    Event("conversation_updated", [ChatMessage])
    Event("conversation_updated", [ChatMessage])
    Event("conversation_updated", [ChatMessage])
    Event("conversation_updated", [ChatMessage])
    Event("reminder_required", [])
    Event("snapshot_updated", [EditorSnapshot])
    Event("snapshot_updated", [EditorSnapshot])
    Event("snapshot_updated", [EditorSnapshot])
    Event("snapshot_updated", [EditorSnapshot])
    Event("snapshot_updated", [EditorSnapshot])
]

Invoker

"""

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            host="0.0.0.0",
            port=8081,
            # load_fnc=CustomLoadCalc.get_load,
            # load_threshold=0.80,  # max(cpu_load, mem_load)
            # shutdown_process_timeout=30,  # seconds
            num_idle_processes=5,  # number of idle agents to keep
        )
    )
