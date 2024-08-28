import asyncio
import logging
import os

from dotenv import load_dotenv, find_dotenv
from convex import ConvexClient
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.rtc import DataPacket
from livekit.agents.voice_assistant import (
    VoiceAssistant,
)
from livekit.plugins import deepgram, openai, silero

from agent_server.langgraph_llm import LangGraphLLM
from agent_server.types import (
    SessionMetadata,
    EditorSnapshot,
    EditorState,
    TerminalState,
)

logger = logging.getLogger("minimal-assistant")
logger.setLevel(logging.DEBUG)
file_handler = logging.FileHandler("minimal_assistant.log")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(
    logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
)

logger.addHandler(file_handler)

load_dotenv(find_dotenv())


def prewarm_fnc(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext()
    convex_client = ConvexClient(deployment_url=os.getenv("CONVEX_URL") or "")

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
        result = convex_client.query(
            "editorSnapshots:getLatestSnapshotBySessionId",
            {"sessionId": session_id_fut.result()},
        )

        logger.info(f"Got snapshot: {result}")
        session_metadata = session_metadata_fut.result()
        snapshot = EditorSnapshot(
            editor=EditorState(
                language=result["editor"]["language"],
                content=result["editor"]["content"],
                last_updated=result["editor"]["lastUpdated"],
            ),
            terminal=TerminalState(
                output=result["terminal"]["output"],
                is_error=result["terminal"]["isError"],
                execution_time=result["terminal"].get("executionTime", None),
            ),
        )

        agent.set_agent_context(session_metadata, snapshot, interaction_type)
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
        if data.topic == "session-id":
            logger.info("Received data for topic: %s", data.topic)
            if not session_id_fut.done():
                session_id_fut.set_result(data.data.decode("utf-8"))
            else:
                logger.warning("session_id_fut already set")
        else:
            logger.warning("Unexpected data topic: %s", data.topic)

    async def prepare_session_and_acknowledge():
        result = convex_client.query(
            "sessions:getSessionMetadata",
            {"sessionId": session_id_fut.result()},
        )

        session_metadata = SessionMetadata.model_validate(result)
        session_metadata_fut.set_result(session_metadata)

        await ctx.room.local_participant.publish_data(
            payload="session-id-received",
            topic="session-id-received",
            reliable=True,
        )

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
        )
    )
