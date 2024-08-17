import asyncio

from dotenv import load_dotenv, find_dotenv
from livekit import rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.plugins import deepgram, openai, silero
from livekit_agent.langGraph_llm import (
    LangGraphLLM,
    _build_oai_message,
    convert_msgs_to_langchain_msgs,
)

from livekit_agent.voice_assistant import VoiceAssistant

load_dotenv(find_dotenv())


# enable nested asyncio

import nest_asyncio

nest_asyncio.apply()


def prewarm_fnc(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    initial_ctx = llm.ChatContext()

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Custom LangGraph Client
    # client = get_client(url=os.environ["LANGGRAPH_API_URL"])

    assistant = VoiceAssistant(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=await LangGraphLLM.create(),
        tts=openai.TTS(),
        chat_ctx=initial_ctx,
        plotting=True,
    )
    assistant.start(ctx.room)

    # listen to incoming chat messages, only required if you'd like the agent to
    # answer incoming messages from Chat
    chat = rtc.ChatManager(ctx.room)

    async def answer_from_text(txt: str):
        chat_ctx = assistant.chat_ctx.copy()
        chat_ctx.append(role="user", text=txt)
        stream = assistant.llm.chat(chat_ctx=chat_ctx)
        await assistant.say(stream)

    @assistant.on("agent_speech_committed")
    def update_message_state_for_agent(msg: llm.ChatMessage):
        print("-------------------" * 5)
        print("agent_speech_committed")
        print(msg)
        print("-------------------" * 5)
        message = _build_oai_message(msg, id(assistant.llm))
        langchain_messages = convert_msgs_to_langchain_msgs([message])
        asyncio.run(assistant.llm.update_state(langchain_messages))

    @assistant.on("user_speech_committed")
    def update_message_state_for_user(msg: llm.ChatMessage):
        print("-------------------" * 5)
        print("user_speech_committed")
        print(msg)
        print("-------------------" * 5)
        message = _build_oai_message(msg, id(assistant.llm))
        langchain_messages = convert_msgs_to_langchain_msgs([message])

        asyncio.run(assistant.llm.update_state(langchain_messages))

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

    @chat.on("message_received")
    def on_chat_received(msg: rtc.ChatMessage):
        if msg.message:
            asyncio.create_task(answer_from_text(msg.message))

    await asyncio.sleep(1)
    await assistant.say(
        assistant.llm.chat(chat_ctx=initial_ctx),
        allow_interruptions=True,
        add_to_chat_ctx=True,
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, prewarm_fnc=prewarm_fnc))
