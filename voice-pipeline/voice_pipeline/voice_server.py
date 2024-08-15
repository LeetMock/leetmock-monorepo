import logging
import sys
import time
import numpy as np

from google.cloud import speech
from google.cloud.speech_v1.types.cloud_speech import StreamingRecognitionConfig
from pathlib import Path
from google.protobuf import duration_pb2

from voice_pipeline.custom_types import WordTimestamp  # type: ignore

for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

# Configure your logger
logger = logging.getLogger(__name__)

logger.setLevel(logging.DEBUG)

# Create console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
file_handler = logging.FileHandler(Path(__file__).parent / "voice_pipeline.log")
file_handler.setLevel(logging.DEBUG)

# Create formatter
formatter = logging.Formatter("%(levelname)s: %(asctime)s - %(name)s - %(message)s")
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

# Add console handler to logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# Prevent the logger from propagating messages to ancestors
logger.propagate = False




def convert_float32_to_int16(float32_array):
    # Convert bytes to numpy array of float32
    float32_np = np.frombuffer(float32_array, dtype=np.float32)

    # Ensure audio values are within [-1, 1] range
    float32_np = np.clip(float32_np, -1, 1)

    # Convert to int16
    int16_np = (float32_np * 32767).astype(np.int16)

    # Convert back to bytes
    return int16_np.tobytes()



def get_current_time() -> int:
    """Return Current Time in MS.

    Returns:
        int: Current Time in MS.
    """

    return int(round(time.time() * 1000))


def listen_print_loop(responses: object, buffer) -> str:
    """Iterates through server responses and prints them.

    The responses passed is a generator that will block until a response
    is provided by the server.

    Each response may contain multiple results, and each result may contain
    multiple alternatives; for details, see https://goo.gl/tjCPAU.  Here we
    print only the transcription for the top alternative of the top result.

    In this case, responses are provided for interim results as well. If the
    response is an interim one, print a line feed at the end of it, to allow
    the next result to overwrite it, until the response is a final one. For the
    final one, print a newline to preserve the finalized transcription.

    Args:
        responses: List of server responses

    Returns:
        The transcribed text.
    """
    transcript = ""
    result = None
    for response in responses:
        if not response.results:
            continue
        # The `results` list is consecutive. For streaming, we only care about
        # the first result being considered, since once it's `is_final`, it
        # moves on to considering the next utterance.
        result = response.results[0]
        if not result.alternatives:
            continue

        # Display the transcription of the top alternative.
        transcript = result.alternatives[0].transcript

        # print(
        #     f"TRANSCRIPT: Time Delta {(get_current_time() - buffer.open_time)/1000} s"
        # )
        # print(transcript)
    if not transcript or not result:
        return "", []
    return transcript, result.alternatives[0].words


def transcribe_streaming(audio_buffer, request, callback):
    """Transcribes audio chunks using Google Cloud Speech API."""
    client = speech.SpeechClient()

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
        audio_channel_count=1,
        enable_word_time_offsets=True,
        enable_automatic_punctuation=True,
    )
    speech_end_timeout = duration_pb2.Duration(seconds=1)
    streaming_config = StreamingRecognitionConfig(
        config=config, 
        interim_results=True, 
        single_utterance=True,               # setting this to True will make the STT stop once is_final is True
        enable_voice_activity_events=True,
        voice_activity_timeout=StreamingRecognitionConfig.VoiceActivityTimeout(speech_end_timeout=speech_end_timeout), # setting this to 1s will make the STT stop once it detects silence for 1s
    )

    # with open("gettysburg.wav", "rb") as audio_file:
    #     content = audio_file.read()
    # stream = [content]

    logger.info("TTS: Streaming")
    requests = (
        speech.StreamingRecognizeRequest(audio_content=chunk)
        for chunk in audio_buffer.generator()
    )
    responses = client.streaming_recognize(streaming_config, requests)
    logger.info("Starting transcription...")
    transcript, words = listen_print_loop(responses, audio_buffer)
    logger.info("Transcription complete")
    logger.info(f"{transcript=}")
    if not transcript:
        transcript = "(You cannot hear the user clearly because the user interrupts you for a very brief period and the microphone did not catch their speech, you should say you didn't hear them clearly, ask for clarification, and repeat your last message)"
        words = [
            speech.WordInfo(word=transcript, start_time=duration_pb2.Duration(seconds=0), end_time=duration_pb2.Duration(seconds=0))
            ]
    callback(transcript, words, request)
