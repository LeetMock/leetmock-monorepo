import asyncio
from datetime import datetime
import io
import json
import logging
import os
import threading
import traceback
from convex import ConvexClient
import numpy as np
import socketio
import uuid
from voice_pipeline.custom_types import (
    AudioRequest,
    EndInterviewRequest,
    EventRequest,
    EventResponse,
    LLMResponse,
    LLMResponseResponse,
    RegisterInterviewRequest,
    ResponseRequiredRequest,
    UserConnection,
    Utterance,
    WordTimestamp,
)
from pathlib import Path
from openai import OpenAI
import websocket
import select
from logging import getLogger
from voice_pipeline.voice_server import (
    convert_float32_to_int16,
    transcribe_streaming,
)
from google.cloud.speech_v1.types.cloud_speech import WordInfo

for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)
# Configure your logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
# Create console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
file_handler = logging.FileHandler(Path(__file__).parent / "voice_pipeline.log")
file_handler.setLevel(logging.DEBUG)
# Create formatter
formatter = logging.Formatter('%(levelname)s: %(asctime)s - %(name)s - %(message)s')
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)
# Add console handler to logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)
# Prevent the logger from propagating messages to ancestors
logger.propagate = False

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

sio = socketio.AsyncServer(
    cors_allowed_origins="*", async_mode="asgi", max_http_buffer_size=10000000
)  # Max size per message is 10MB
socket_app = socketio.ASGIApp(sio)
convex_client = ConvexClient(deployment_url=os.environ["CONVEX_URL"])

ws_pool: dict[str, UserConnection] = {}
agent_start_receive_time = None
agent_total_receive_time = 0
agent_total_receive_count = 0

first_token_time = None
first_token_count = 0
total_first_token_time = 0

get_connection = lambda user_id: (
    ws_pool[str(user_id)] if str(user_id) in ws_pool else None
)
del_connection = lambda user_id: ws_pool.pop(str(user_id), None)
get_response_id = lambda user_id: ws_pool[str(user_id)].latest_response_id

# TODO: change to Redis
get_words_map = lambda user_id: ws_pool[str(user_id)].words_map
get_utterance_list = lambda user_id: ws_pool[str(user_id)].utterance_list

get_audio_buffer = lambda user_id: ws_pool[str(user_id)].audio_buffer
get_word_buffer = lambda user_id: ws_pool[str(user_id)].word_buffer

def increment_response_id(user_id: int):
    ws_pool[str(user_id)].latest_response_id += 1


def set_connection(user_id: int, connection: UserConnection):
    ws_pool[str(user_id)] = connection


def get_transcription(raw_audio: bytes):
    buffer = io.BytesIO()
    buffer.name = "audio.wav"
    buffer.write(raw_audio)
    return client.audio.transcriptions.create(
        file=buffer,
        model="whisper-1",
        response_format="verbose_json",
        timestamp_granularities=["word"],
    ).to_dict()


def get_audio_response(user_speech: str, voice: str):
    response = client.audio.speech.create(
        input=user_speech, model="tts-1", voice=voice, response_format="pcm"
    )
    return response


def build_transcript(user_id: int):
    return [u for u in get_utterance_list(user_id)]


async def response_handler(sid: str, session_id: str, user_id: int, response_id: int):
    try:
        word_buffer = get_word_buffer(user_id)
        voice = get_connection(user_id).voice
        complete_response = ""
        now = datetime.now()
        for word_chunk in word_buffer.generator():
            logger.info(f"TIME - voice-pipeline -> word chunk - before TTS - {now.strftime('%H:%M:%S')}")
            for chunk in get_audio_response(word_chunk, voice).iter_bytes():
                audio = chunk
                await sio.emit("agent-start-talking", {"data": audio }, to=sid)
                logger.info(
                    f"TIME - voice-pipeline -> user - {response_id=} {word_chunk=} Audio Response Chunk Length: {len(audio)} bytes"
                )
            complete_response += word_chunk
            
        delta = datetime.now() - now
        logger.info(
            f"TIME - voice-pipeline - All word chunk TTS Completed - {datetime.now().strftime('%H:%M:%S')} - {delta.total_seconds()}s"
        )
        await sio.emit(
            "content-complete",
            {"data": {"session_id": session_id}},
            to=session_id,
        )
        get_utterance_list(user_id).append(
            Utterance(role="agent", content=complete_response, words=[])
        )
        res = EventResponse(success=True)
        return res
    except Exception as e:
        logger.info(traceback.format_exc())
        return EventResponse(success=False, error=str(e))


def ws_on_close(ws: websocket.WebSocketApp, close_status_code: int, close_msg: str):
    logger.info(
        f"ws_on_close: {ws.header['session_id']} {close_status_code=} {close_msg=}"
    )


def ws_on_message(ws: websocket.WebSocketApp, message: str):

    def generate_agent_response_TTS(sid: str, session_id: str, user_id: int, response_id: int):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            res = loop.run_until_complete(
                response_handler(sid, session_id, user_id, response_id)
            )
            if (not res.success) or response.end_call:
                logger.info(f"response_handler failed: {res.error}")
        except Exception as e:
            logger.info(traceback.format_exc())
            ws.close()
        finally:
            loop.close()

    # Received response from LLM Server until the response is complete
    response = LLMResponseResponse(**json.loads(message))
    
    if get_connection(ws.header["user_id"]) and response.response_type == "response":
        
        global first_token_time
        if first_token_time:
            global first_token_count
            global total_first_token_time
            first_token_count += 1
            total_first_token_time += (datetime.now() - first_token_time).total_seconds()
            logger.info(
                f"Agent First Token Count #{first_token_count} Avg Time: {total_first_token_time / first_token_count}s"
            )
            first_token_time = None
        
        logger.debug(f"ws_on_message: {ws.header['session_id']} {message}")
        words_map = get_words_map(ws.header["user_id"])
        is_first_message = str(response.response_id) not in words_map
        words_map[str(response.response_id)].append(response.content)
        word_buffer = get_word_buffer(ws.header["user_id"])
        word_buffer.add_word_chunk(response.content)
        
        if response.content_complete:
            word_buffer.close()
            logger.info(f"current word buffer size: {word_buffer.length=}")
            now = datetime.now()
            global agent_start_receive_time
            if agent_start_receive_time:
                logger.info(
                    f"TIME - agent -> voice pipeline - complete response spent - {(now - agent_start_receive_time).total_seconds()}s"
                )
                global agent_total_receive_time
                global agent_total_receive_count
                agent_total_receive_time += (now - agent_start_receive_time).total_seconds()
                agent_total_receive_count += 1
                logger.info(
                    f"Agent Response Count #{agent_total_receive_count} Avg Time: {agent_total_receive_time / agent_total_receive_count}s"
                )
            agent_start_receive_time = None
            # TODO, this is incorrect, need to initiate this thread once the first token is received
        
        if is_first_message:
            # First response from the agent
            threading.Thread(
                target=generate_agent_response_TTS,
                args=(
                    ws.header["sid"],
                    ws.header["session_id"],
                    ws.header["user_id"],
                    response.response_id,
                ),
                daemon=True,
            ).start()
            word_buffer.response_id = response.response_id


async def establish_connection_with_llm_server(
    sid: str, request: RegisterInterviewRequest
):
    try:
        if get_connection(request.user_id):
            # return EventResponse(
            #     success=False, error="User is already in an interview"
            # ).model_dump()
            ws_app = get_connection(request.user_id).ws
            logger.info(
                f"User {request.user_id} is already in an interview - ending the previous one"
            )
            ws_app.close()
            del_connection(request.user_id)

        # create a new session
        session_id = str(uuid.uuid4())
        res = convex_client.mutation(
            "sessions:create",
            {
                "code_block": "",
                "session_id": session_id,
                "session_period": request.session_period,
                "time_remain": request.session_period,
                "user_id": request.user_id,
                "question_id": request.question_id,
            },
        )
        logger.info(f"New Session Created: {res}")

        ws = websocket.WebSocketApp(
            url=f"{os.environ['LLM_SERVER_WS_URL']}/voice-pipeline-llm-websocket/{session_id}",
            header={
                "user_id": str(request.user_id),
                "session_id": session_id,
                "sid": sid,
            },
            on_message=ws_on_message,
            on_close=ws_on_close,
        )
        set_connection(
            request.user_id,
            UserConnection(
                ws=ws,
                session_id=session_id,
                user_id=request.user_id,
                latest_response_id=0,
            ),
        )
        logger.info(ws_pool[str(request.user_id)])
        logger.info(f"Connecting to LLM Server for {request.user_id}")
        # use a separate thread to run the websocket
        # ws.run_forever()
        threading.Thread(target=ws.run_forever, daemon=True).start()
        logger.info(f"Connection Established with LLM Server for {request.user_id}")
        return EventResponse(success=True, data={"session_id": session_id}).model_dump()

    except Exception as e:
        logger.info(traceback.format_exc())
        return EventResponse(success=False, error=str(e)).model_dump()


@sio.on("user-talk-stream-start")
async def user_talking_stream_start(sid, request):
    request = EventRequest(**request)
    # Start the transcription task
    audio_buffer = get_audio_buffer(request.user_id)
    audio_buffer.open()
    logging.info(f"User {request.user_id} has started talking")
    threading.Thread(
        target=transcribe_streaming,
        args=(audio_buffer, request, finish_transcript_callback),
        daemon=True,
    ).start()

    return EventResponse(success=True).model_dump()


@sio.on("user-talk-stream-end")
async def user_talking_stream_end(sid, request):
    request = EventRequest(**request)
    audio_buffer = get_audio_buffer(request.user_id)
    audio_buffer.close()

    logger.info(f"User {request.user_id} has stopped talking")
    global agent_start_receive_time
    if agent_start_receive_time is None:
        agent_start_receive_time = datetime.now()
    return EventResponse(success=True).model_dump()


@sio.on("user-talk-stream-data")
async def user_talk_stream_data(sid, request):
    try:
        request = AudioRequest(**request)
        audio_buffer = get_audio_buffer(request.user_id)
        audio_data = convert_float32_to_int16(request.data)

        # pa = pyaudio.PyAudio()
        # pa_stream = pa.open(
        #     format=pyaudio.get_format_from_width(2),
        #     channels=1,
        #     rate=16000,
        #     output=True
        # )
        # pa_stream.write(audio_data)
        audio_buffer.add_audio_chunk(audio_data)
    except Exception as e:
        logger.info(traceback.format_exc())
        return EventResponse(success=False, error=str(e)).model_dump()


@sio.on("connect")
async def connect(sid, environ):
    logger.info(f"id: {sid} - user: TODO connected")
    # check if the user is already in an interview


@sio.on("disconnect")
async def disconnect(sid):
    logger.info(f"Client Disconnected {sid}")


def convert_word_info_to_word_timestamp(word_info: WordInfo) -> WordTimestamp:
    return WordTimestamp(
        word=word_info.word,
        start=word_info.start_time.seconds * 1000,
        end=word_info.end_time.seconds * 1000,
    )


def finish_transcript_callback(transcript: str, words, request):
    if not transcript or not words:
        return
    user_utterance = Utterance(
        role="user",
        content=transcript,
        words=[convert_word_info_to_word_timestamp(word) for word in words],
    )

    logger.info(f"Utterance Script: {user_utterance.content}")
    ws = get_connection(request.user_id).ws

    increment_response_id(request.user_id)

    get_utterance_list(request.user_id).append(user_utterance)

    logger.info(
        f"TIME - user -> agent - send speech data before - {datetime.now().strftime('%H:%M:%S')}"
    )
    
    global first_token_time
    first_token_time = datetime.now()

    ws.send(
        ResponseRequiredRequest(
            interaction_type="response_required",
            response_id=get_response_id(request.user_id),
            transcript=build_transcript(request.user_id),
        ).model_dump_json()
    )


"""
Deprecated Endpoint for Non-streaming Voice Pipeline
"""
@sio.on("send-speech-data")
async def send_speech_data(sid, request):
    if False:
        return EventResponse(success=False, error="TESTing").model_dump()
    try:
        request = AudioRequest(**request)
        logger.debug(f"Audio Received from {sid} length {len(request.data)}")
        # print current time in hh:mm:ss format
        now = datetime.now()
        logger.debug(
            f"TIME - user -> agent - receive speech - {datetime.now().strftime('%H:%M:%S')}"
        )
        transcription = get_transcription(request.data)
        delta = datetime.now() - now
        logger.debug(
            f"TIME - user -> agent - get transcription - {datetime.now().strftime('%H:%M:%S')} - {delta.total_seconds()}s"
        )
        logger.debug(f"{transcription=}")
        ws = get_connection(request.user_id).ws

        increment_response_id(request.user_id)

        user_utterance = Utterance(
            role="user",
            content=transcription["text"],
            words=[
                WordTimestamp.model_validate(word) for word in transcription["words"]
            ],
        )
        get_utterance_list(request.user_id).append(user_utterance)

        logger.info(
            f"TIME - user -> agent - send speech data before - {datetime.now().strftime('%H:%M:%S')}"
        )

        ws.send(
            ResponseRequiredRequest(
                interaction_type="response_required",
                response_id=get_response_id(request.user_id),
                transcript=build_transcript(request.user_id),
            ).model_dump_json()
        )

        # audio = get_audio_response(transcription)

        # logger.info(f"Audio Response Length: {len(audio.content)}")
        # await sio.emit("agent-start-talking", {"data": audio.content}, to=sid)
        delta = datetime.now() - now
        logger.info(
            f"TIME - user -> agent - send speech data finish - {datetime.now().strftime('%H:%M:%S')} - total sio time {delta.total_seconds()}s"
        )
        return EventResponse(success=True).model_dump()
    except Exception as e:
        logger.info(traceback.format_exc())
        return EventResponse(success=False, error=str(e)).model_dump()


@sio.on("start-interview")
async def start_interview(sid, request):
    request = RegisterInterviewRequest(**request)
    logger.info(
        f"Interview started for user-id {request.user_id} with question-id {request.question_id}"
    )
    res = await establish_connection_with_llm_server(sid, request)

    return res


@sio.on("end-interview")
async def end_interview(sid, request):
    request = EndInterviewRequest(**request)
    if get_connection(request.user_id):
        get_connection(request.user_id).ws.close()
        del_connection(request.user_id)
        logger.info(f"Interview Ended for {sid=} {request=}")
    else:
        logger.info(f"User {request.user_id} is not in an interview")
    # potentially convex mutation?
    return EventResponse(success=True).model_dump()

@sio.on("voice-change")
async def voice_change(sid, request):
    request = EventRequest(**request)
    get_connection(request.user_id).voice = request.data["voice"]
    return EventResponse(success=True).model_dump()