import asyncio
import logging
import os
import sys

from dotenv import load_dotenv, find_dotenv
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
    utils,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero
from livekit_agent.langGraph_llm import (
    LangGraphLLM,
    convert_livekit_msgs_to_langchain_msgs,
    hash_msg,
)
import logging
import nest_asyncio


logger = logging.getLogger("minimal-assistant")
logger.setLevel(logging.DEBUG)
file_handler = logging.FileHandler("minimal_assistant.log")
file_handler.setLevel(logging.DEBUG)
logger.addHandler(file_handler)

load_dotenv(find_dotenv())


# enable nested asyncio
nest_asyncio.apply()


def prewarm_fnc(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


WIDTH = 640
HEIGHT = 480
COLOR = [255, 255, 0, 0]  # FFFF0000 RED


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext().append(
        role="system", text="(A user joined the room)"
    )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

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

    assistant = VoiceAssistant(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=await LangGraphLLM.create(),
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

    @assistant.on("user_speech_committed")
    def update_message_state_for_user(msg: llm.ChatMessage):
        logger.info(f"user_speech_committed: {msg}")

    @assistant.on("user_stopped_speaking")
    def on_user_stopped_speaking():
        logger.info("user_stopped_speaking")

    @assistant.on("agent_speech_interrupted")
    def on_agent_speech_interrupted(msg: llm.ChatMessage):
        logger.info(f"agent_speech_interrupted: {msg}")

    @assistant.on("agent_stopped_speaking")
    def on_agent_stopped_speaking():
        logger.info("agent_stopped_speaking")

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
