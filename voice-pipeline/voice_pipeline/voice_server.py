import asyncio
import logging
import re
import sys
import time
import queue
from google.cloud import speech
import numpy as np
from pathlib import Path

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

def convert_float32_to_int16(float32_array):
    # Convert bytes to numpy array of float32
    float32_np = np.frombuffer(float32_array, dtype=np.float32)

    # Ensure audio values are within [-1, 1] range
    float32_np = np.clip(float32_np, -1, 1)

    # Convert to int16
    int16_np = (float32_np * 32767).astype(np.int16)

    # Convert back to bytes
    return int16_np.tobytes()

class WordsStreamBuffer:
    """Handles words data buffering using a queue."""

    @property
    def length(self):
        return self._buff.qsize()

    def __init__(self):
        self._buff = queue.Queue()
        self.closed = False

    def open(self):
        """Open the buffer to start accepting word chunks."""
        self.closed = False
        self.open_time = get_current_time()

    def add_word_chunk(self, chunk):
        """Add audio chunk to buffer."""
        self._buff.put(chunk)

    def close(self):
        """Close the buffer to indicate the end of the stream."""
        self._buff.put(None)

    def generator(self):
        """Generate words chunks from buffer."""
        leftover = None
        while True:
            chunk = self._buff.get()
            if chunk is None:
                logger.info("STT: Closing buffer initial")
                return
            if leftover is not None:
                data = [leftover, chunk]
                leftover = None
                # early yield for faster TTS initial response
                if any([symbol in res for symbol in ["!", "?", "."]]):
                    logger.info(f"STT: Leftover Early Yielding {data=} ")
                    yield "".join(data)
                    continue
            else:
                data = [chunk]
            while True:
                try:
                    chunk = self._buff.get(block=False)
                    data.append(chunk)
                    if chunk is None:
                        logger.info("STT: Closing buffer subsequent")
                        break
                    elif any([symbol in chunk for symbol in ["!", "?", "."]]):
                        logger.info(f"STT: Early Meaningful Yielding {data=} ")
                        break
                except queue.Empty:
                    break

            if None in data:
                logger.info(f"STT: Yielding {data[:-1]=} ")
                res = "".join(data[:-1])
                if res:
                    yield res
                return

            res = "".join(data)
            if not res:
                continue
            # elif "!" not in res or "?" not in res or "." not in res:
            elif not any([symbol in res for symbol in ["!", "?", "."]]):
                leftover = res
                continue
            logger.info(f"STT: Yielding {data=} ")
            yield res

class AudioStreamBuffer:
    """Handles audio data buffering using a queue."""

    def __init__(self):
        self._buff = queue.Queue()
        self.closed = False

    def open(self):
        """Open the buffer to start accepting audio chunks."""
        self.closed = False
        self.open_time = get_current_time()

    def add_audio_chunk(self, chunk):
        """Add audio chunk to buffer."""
        self._buff.put(chunk)

    def close(self):
        """Close the buffer to indicate the end of the stream."""
        self._buff.put(None)

    def generator(self):
        """Generate audio chunks from buffer."""
        while True:
            chunk = self._buff.get()
            if chunk is None:
                logger.info("TTS: Closing buffer")
                return
            data = [chunk]

            while True:
                try:
                    chunk = self._buff.get(block=False)
                    data.append(chunk)
                    if chunk is None:
                        logger.info("TTS: Closing buffer")
                        break
                except queue.Empty:
                    break

            if None in data:
                return b"".join(data[:-1])
            yield b"".join(data)


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
    streaming_config = speech.StreamingRecognitionConfig(
        config=config, interim_results=True
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
    callback(transcript, words, request)

