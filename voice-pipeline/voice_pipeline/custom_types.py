from collections import defaultdict
from typing import DefaultDict, List, Literal, Optional, Union
from pydantic import BaseModel, ConfigDict, Field
import websocket

from voice_pipeline.voice_server import AudioStreamBuffer, WordsStreamBuffer


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


LLMResponse = Union[LLMResponseResponse, LLMPingPongResponse]
