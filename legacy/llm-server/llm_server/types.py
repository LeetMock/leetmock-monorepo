from typing import List, Optional, Literal, Union, TypedDict
from pydantic import BaseModel
from typing import Literal, Dict, Optional


class WordTimestamp(BaseModel):
    word: str
    start: float
    end: float


# Retell -> Your Server Events
class Utterance(BaseModel):
    role: Literal["agent", "user", "system"]
    content: str
    words: List[WordTimestamp]


class PingPongRequest(BaseModel):
    interaction_type: Literal["ping_pong"]
    timestamp: int


class CallDetailsRequest(BaseModel):
    interaction_type: Literal["call_details"]
    call: dict


class UpdateOnlyRequest(BaseModel):
    interaction_type: Literal["update_only"]
    transcript: List[Utterance]


class ResponseRequiredRequest(BaseModel):
    interaction_type: Literal["reminder_required", "response_required"]
    response_id: int
    transcript: List[Utterance]


RetellRequest = Union[
    ResponseRequiredRequest,
    UpdateOnlyRequest,
    CallDetailsRequest,
    PingPongRequest,
]


class ConfigDict(TypedDict):
    auto_reconnect: bool
    call_details: bool


# Your Server -> Retell Events
class ConfigResponse(BaseModel):
    response_type: Literal["config"] = "config"
    config: ConfigDict


class PingPongResponse(BaseModel):
    response_type: Literal["ping_pong"] = "ping_pong"
    timestamp: int


class ResponseResponse(BaseModel):
    response_type: Literal["response"] = "response"
    response_id: int
    content: str
    content_complete: bool
    end_call: Optional[bool] = False
    transfer_number: Optional[str] = None


RetellResponse = Union[
    ConfigResponse,
    PingPongResponse,
    ResponseResponse,
]
