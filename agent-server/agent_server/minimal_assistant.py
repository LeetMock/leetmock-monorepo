import asyncio
import logging

from dotenv import load_dotenv, find_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.rtc import DataPacket
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero

from agent_server.langgraph_llm import LangGraphLLM
from agent_server.types import EditorState

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
    initial_ctx = llm.ChatContext().append(
        role="system", text="(A user joined the room)"
    )

    reminder_task: asyncio.Task | None = None
    reminder_delay = 10  # seconds

    async def debounced_send_reminder():
        nonlocal reminder_task
        if reminder_task:
            logger.info("Reminder task cancelled")
            reminder_task.cancel()

        async def delayed_reminder():
            await asyncio.sleep(reminder_delay)
            await send_reminder()

        reminder_task = asyncio.create_task(delayed_reminder())

    async def send_reminder():
        logger.info(f"Reminder sent")
        await assistant.say(
            assistant.llm.chat(
                chat_ctx=assistant.chat_ctx.append(
                    role="system", text="should get into reminder state now"
                ),
                interaction_type="reminder_required",
            ),
            allow_interruptions=True,
            add_to_chat_ctx=True,
        )

    # # Not used anymore since we are using stateless LLM chat
    # async def will_synthesize_assistant_reply(
    #     assistant: VoiceAssistant, copied_ctx: llm.ChatContext
    # ) -> llm.LLMStream:

    #     langchain_messages = convert_livekit_msgs_to_langchain_msgs(
    #         copied_ctx.messages
    #     )  # only the last message

    #     assert isinstance(assistant.llm, LangGraphLLM), "Expected LangGraphLLM"

    #     print(f"langchain_messages: {langchain_messages}")

    #     # Await the update_state function directly
    #     await assistant.llm.update_state(langchain_messages[-1])

    #     # Return the result of _default_will_synthesize_assistant_reply
    #     return _default_will_synthesize_assistant_reply(assistant, copied_ctx)

    # source = rtc.VideoSource(WIDTH, HEIGHT)
    # track = rtc.LocalVideoTrack.create_video_track("example-track", source)
    # options = rtc.TrackPublishOptions(
    #     # since the agent is a participant, our video I/O is its "camera"
    #     source=rtc.TrackSource.SOURCE_CAMERA,
    # )
    # publication = await ctx.agent.publish_track(track, options)

    # async def _draw_color():
    #     argb_frame = bytearray(WIDTH * HEIGHT * 4)
    #     while True:
    #         await asyncio.sleep(0.1)  # 10 fps
    #         argb_frame[:] = COLOR * WIDTH * HEIGHT
    #         frame = rtc.VideoFrame(WIDTH, HEIGHT, rtc.VideoBufferType.RGBA, argb_frame)

    #         # send this frame to the track
    #         source.capture_frame(frame)

    # asyncio.create_task(_draw_color())

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    agent = await LangGraphLLM.create()
    assistant = VoiceAssistant(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=agent,
        tts=openai.TTS(),
        chat_ctx=initial_ctx,
        # will_synthesize_assistant_reply=will_synthesize_assistant_reply,
    )
    assistant.start(ctx.room)

    @assistant.on("agent_speech_committed")
    def update_message_state_for_agent(msg: llm.ChatMessage):
        # langchain_msg = convert_livekit_msgs_to_langchain_msgs([msg])[0]
        # langchain_msg.id = hash_msg(msg)
        # assert isinstance(assistant.llm, LangGraphLLM), "Expected LangGraphLLM"
        # asyncio.run(assistant.llm.update_state(langchain_msg))
        logger.info(f"agent_speech_committed: {msg}")

        # Send a reminder event to the agent after 10 seconds of silence since the
        # last agent speech committed
        asyncio.create_task(debounced_send_reminder())

    @assistant.on("user_speech_committed")
    def update_message_state_for_user(msg: llm.ChatMessage):
        logger.info(f"user_speech_committed: {msg}")

        # Send a reminder event to the agent after 10 seconds of silence since the
        # last agent speech committed
        asyncio.create_task(debounced_send_reminder())

    @assistant.on("user_stopped_speaking")
    def on_user_stopped_speaking():
        logger.info("user_stopped_speaking")

    @assistant.on("agent_speech_interrupted")
    def on_agent_speech_interrupted(msg: llm.ChatMessage):
        logger.info(f"agent_speech_interrupted: {msg}")

    @assistant.on("agent_stopped_speaking")
    def on_agent_stopped_speaking():
        logger.info("agent_stopped_speaking")

    @ctx.room.on("data_received")
    def on_data_received(data: DataPacket):
        logger.info("Received data for topic: %s", data.topic)
        editor_state = EditorState.model_validate_json(data.data)
        agent.set_editor_state(editor_state)
        logger.info(f"Received editor state: {editor_state}")

    await ctx.room.local_participant.publish_data(
        "my payload",
        reliable=True,
        topic="test",
    )

    await asyncio.sleep(1)
    await assistant.say(
        assistant.llm.chat(chat_ctx=initial_ctx),
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
