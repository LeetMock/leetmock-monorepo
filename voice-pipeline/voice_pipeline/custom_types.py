from collections import defaultdict
import logging
import queue
import sys
from typing import DefaultDict, List, Literal, Optional, Union
from pydantic import BaseModel, ConfigDict, Field
import websocket
from pathlib import Path

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


class AudioRequest(BaseModel):
    data: bytes
    user_id: int
    session_id: str


class EventRequest(BaseModel):
    event_type: Optional[str] = None
    user_id: int
    session_id: str
    data: Optional[dict] = None


class RegisterInterviewRequest(BaseModel):
    user_id: int
    question_id: int
    session_period: int


class EndInterviewRequest(BaseModel):
    user_id: int
    session_id: str


class EventResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    data: Optional[dict] = None


class LLMResponseResponse(BaseModel):
    response_type: Literal["response"] = "response"
    response_id: int
    content: str
    content_complete: bool
    end_call: Optional[bool] = False
    transfer_number: Optional[str] = None


class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float


class Utterance(BaseModel):
    role: Literal["agent", "user", "system"]
    content: str
    words: List[WordTimestamp]


class ResponseRequiredRequest(BaseModel):
    interaction_type: Literal["reminder_required", "response_required"]
    response_id: int
    transcript: List[Utterance]


class LLMPingPongResponse(BaseModel):
    response_type: Literal["ping_pong"] = "ping_pong"
    timestamp: int




LLMResponse = Union[LLMResponseResponse, LLMPingPongResponse]



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

    def add_word_chunk(self, chunk):
        """Add audio chunk to buffer."""
        self._buff.put(chunk)

    def close(self):
        """Close the buffer to indicate the end of the stream."""
        self._buff.put(None)

    def clear(self):
        """Clear the buffer."""
        while not self._buff.empty():
            self._buff.get()


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

class UserConnection(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    session_id: str
    user_id: int
    ws: websocket.WebSocketApp
    latest_response_id: int
    words_map: DefaultDict[str, List[str]] = Field(
        default_factory=lambda: defaultdict(list)
    )
    utterance_list: List[Utterance] = Field(default_factory=list)
    audio_buffer: AudioStreamBuffer = Field(default_factory=AudioStreamBuffer)
    word_buffer: WordsStreamBuffer = Field(default_factory=WordsStreamBuffer)
    voice: str = "nova"
