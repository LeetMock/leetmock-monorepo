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
    utils
)
from livekit.plugins import deepgram, openai, silero
from livekit_agent.langGraph_llm import (
    LangGraphLLM,
    convert_livekit_msgs_to_langchain_msgs,
    hash_msg,
)

from livekit_agent.voice_assistant import VoiceAssistant, _default_will_synthesize_assistant_reply

load_dotenv(find_dotenv())


# enable nested asyncio

import nest_asyncio

nest_asyncio.apply()


def prewarm_fnc(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


WIDTH = 640
HEIGHT = 480
COLOR = [255, 255, 0, 0]  # FFFF0000 RED


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext()

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Custom LangGraph Client
    # client = get_client(url=os.environ["LANGGRAPH_API_URL"])
    
    async def will_synthesize_assistant_reply(
        assistant: VoiceAssistant, copied_ctx: llm.ChatContext
    ) -> llm.LLMStream:
        
        langchain_messages = convert_livekit_msgs_to_langchain_msgs(copied_ctx.messages) # only the last message
        
        assert isinstance(assistant.llm, LangGraphLLM), "Expected LangGraphLLM"
        
        
        print(f"langchain_messages: {langchain_messages}")
        
        # Await the update_state function directly
        await assistant.llm.update_state(langchain_messages[-1])
        
        # Return the result of _default_will_synthesize_assistant_reply
        return _default_will_synthesize_assistant_reply(assistant, copied_ctx)


    source = rtc.VideoSource(WIDTH, HEIGHT)
    track = rtc.LocalVideoTrack.create_video_track("example-track", source)
    options = rtc.TrackPublishOptions(
        # since the agent is a participant, our video I/O is its "camera"
        source=rtc.TrackSource.SOURCE_CAMERA,
    )
    publication = await ctx.agent.publish_track(track, options)

    async def _draw_color():
        argb_frame = bytearray(WIDTH * HEIGHT * 4)
        while True:
            await asyncio.sleep(0.1)  # 10 fps
            argb_frame[:] = COLOR * WIDTH * HEIGHT
            frame = rtc.VideoFrame(WIDTH, HEIGHT, rtc.VideoBufferType.RGBA, argb_frame)

            # send this frame to the track
            source.capture_frame(frame)

    asyncio.create_task(_draw_color())

    assistant = VoiceAssistant(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=await LangGraphLLM.create(),
        tts=openai.TTS(),
        chat_ctx=initial_ctx,
        will_synthesize_assistant_reply=will_synthesize_assistant_reply,
    )
    assistant.start(ctx.room)

    # listen to incoming chat messages, only required if you'd like the agent to
    # answer incoming messages from Chat
    # chat = rtc.ChatManager(ctx.room)

    # async def answer_from_text(txt: str):
        
    #     chat_ctx = assistant.chat_ctx.copy()
    #     chat_ctx.append(role="user", text=txt)
    #     stream = assistant.llm.chat(chat_ctx=chat_ctx)
    #     await assistant.say(stream)

    # @chat.on("message_received")
    # def on_chat_received(msg: rtc.ChatMessage):
    #     if msg.message:
    #         logger.info(f"Received chat message: {msg.message}")
    #         asyncio.create_task(answer_from_text(msg.message))

    @assistant.on("agent_speech_committed")
    def update_message_state_for_agent(msg: llm.ChatMessage):
        print("-------------------" * 5)
        print("agent_speech_committed")
        print(msg)
        print("-------------------" * 5)
        
        langchain_msg = convert_livekit_msgs_to_langchain_msgs([msg])[0]
        langchain_msg.id = hash_msg(msg)
        assert isinstance(assistant.llm, LangGraphLLM), "Expected LangGraphLLM"
        asyncio.run(assistant.llm.update_state(langchain_msg))


    @assistant.on("user_speech_committed")
    def update_message_state_for_user(msg: llm.ChatMessage):
        print("-------------------" * 5)
        print("user_speech_committed")
        print(msg)
        print("-------------------" * 5)


    @assistant.on("user_stopped_speaking")
    def on_user_stopped_speaking():
        print("-------------------" * 5)
        print("user_stopped_speaking")
        print("-------------------" * 5)

    @assistant.on("agent_speech_interrupted")
    def on_agent_speech_interrupted(x):
        print("-------------------" * 5)
        print("agent_speech_interrupted")
        print(x)
        print("-------------------" * 5)

    @assistant.on("agent_stopped_speaking")
    def on_agent_stopped_speaking():
        print("-------------------" * 5)
        print("agent_stopped_speaking")
        print("-------------------" * 5)

    await asyncio.sleep(1)
    await assistant.say(
        assistant.llm.chat(chat_ctx=initial_ctx),
        allow_interruptions=True,
        add_to_chat_ctx=True,
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm_fnc,))