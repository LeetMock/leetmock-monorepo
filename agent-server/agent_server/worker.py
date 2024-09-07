import os
import asyncio
import logging
import psutil
import convex_client

from dotenv import load_dotenv, find_dotenv
from convex_client.models import (
    RequestActionsGetEditorSnapshot,
    RequestActionsGetSessionMetadata,
    RequestSessionsGetByIdArgs,
)
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,  # type: ignore
    llm,
    utils,
)
from livekit.agents.worker import _DefaultLoadCalc
from livekit.rtc import DataPacket
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero
from agent_server.agent import LangGraphLLM
from agent_server.types import SessionMetadata


# Add this near the top of your file, before setting up logging
log_directory = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(log_directory, exist_ok=True)

logger = logging.getLogger("minimal-assistant")
logger.setLevel(logging.INFO)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

file_handler = logging.FileHandler(os.path.join(log_directory, "minimal_assistant.log"))
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)  # Change this line from DEBUG to INFO
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)

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


def prewarm_fnc(proc: JobProcess):
    # load silero weights and store to process userdata
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext()

    configuration = convex_client.Configuration(host=os.getenv("CONVEX_URL") or "")
    api_client = convex_client.ApiClient(configuration)
    action_api = convex_client.ActionApi(api_client)

    session_metadata_fut = asyncio.Future[SessionMetadata]()
    session_id_fut = asyncio.Future[str]()
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
            args=RequestSessionsGetByIdArgs(sessionId=session_id_fut.result())
        )
        response = action_api.api_run_actions_get_editor_snapshot_post(request)

        if response.status == "error" or response.value is None:
            logger.error(f"Error getting snapshot: {response.error_message}")
            raise Exception(f"Error getting snapshot: {response.error_message}")

        logger.info(f"Got snapshot: {response.value}")
        session_metadata = session_metadata_fut.result()

        agent.set_agent_context(session_metadata, response.value, interaction_type)
        return agent.chat(chat_ctx=chat_ctx)

    def will_synthesize_assistant_reply(
        assistant: VoiceAssistant, chat_ctx: llm.ChatContext
    ) -> llm.LLMStream:
        return invoke_agent(chat_ctx, "response_required")

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    agent = LangGraphLLM()
    assistant = VoiceAssistant(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=agent,
        tts=openai.TTS(),
        chat_ctx=initial_ctx,
        will_synthesize_assistant_reply=will_synthesize_assistant_reply,
    )
    assistant.start(ctx.room)

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

    @ctx.room.on("data_received")
    def on_data_received(data: DataPacket):
        if data.topic != "session-id":
            logger.warning("Unexpected data topic: %s", data.topic)
            return

        logger.info("Received data for topic: %s", data.topic)
        logger.info("Received data: %s", data.data)

        session_id = data.data.decode("utf-8")
        if len(session_id) == 0:
            logger.warning("Received empty session id")
            return

        if not session_id_fut.done():
            session_id_fut.set_result(session_id)
            return
        else:
            logger.warning("session_id_fut already set")

        asyncio.create_task(
            ctx.room.local_participant.publish_data(
                payload="session-id-received",
                topic="session-id-received",
                reliable=True,
            )
        )

    async def prepare_session_and_acknowledge():
        request = RequestActionsGetSessionMetadata(
            args=RequestSessionsGetByIdArgs(sessionId=session_id_fut.result())
        )
        response = action_api.api_run_actions_get_session_metadata_post(request)

        if response.status == "error" or response.value is None:
            logger.error(f"Error getting session metadata: {response.error_message}")
            raise Exception(f"Error getting session metadata: {response.error_message}")

        session_metadata_fut.set_result(response.value)

    logger.info("Waiting for session id")
    await session_id_fut
    await prepare_session_and_acknowledge()
    logger.info("Acked session id")

    await assistant.say(
        will_synthesize_assistant_reply(assistant, initial_ctx),
        allow_interruptions=True,
        add_to_chat_ctx=True,
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm_fnc,
            host="0.0.0.0",
            port=8081,
            load_fnc=CustomLoadCalc.get_load,
            load_threshold=0.8,  # max(cpu_load, mem_load)
            shutdown_process_timeout=30,  # seconds
            num_idle_processes=3,  # number of idle agents to keep
        )
    )
