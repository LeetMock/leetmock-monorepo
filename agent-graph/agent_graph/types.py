from typing import Annotated, Any, Dict, List, TypeVar

from langchain_core.load.serializable import Serializable
from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages
from pydantic import BaseModel, Field

TState = TypeVar("TState", bound=BaseModel)
TMetadata = TypeVar("TMetadata", bound=BaseModel)


class EventMessageState(BaseModel):

    messages: Annotated[List[AnyMessage], add_messages] = Field(
        default_factory=list,
        description="Messages to be sent to the agent",
    )

    event: str | None = Field(
        default=None,
        description="Event triggered by the user",
    )

    event_data: Any = Field(
        default=None,
        description="Data associated with the event",
    )

    trigger: bool = Field(
        default=False,
        description="Whether the agent should be triggered",
    )

    session_state: Dict[str, Any] = Field(
        default_factory=dict,
        description="Session state",
    )

    session_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Session metadata",
    )


class NamedEntity(Serializable):
    """Named entity."""

    name: str = Field(..., description="Name")

    @classmethod
    def is_lc_serializable(cls) -> bool:
        return True


class Step(NamedEntity):
    """Agent step definition."""

    description: str = Field(..., description="Step description")

    done_definition: str = Field(
        ..., description="Definition of when the step is considered done"
    )

    required: bool = Field(default=False, description="Whether the step is required")

    @classmethod
    def from_info(
        cls,
        name: str,
        desc: str,
        done_definition: str,
        required: bool,
    ):
        return cls(
            name=name,
            description=desc,
            done_definition=done_definition,
            required=required,
        )


class Signal(NamedEntity):
    """Candidate signal definition."""

    name: str = Field(..., description="Signal name")

    description: str = Field(..., description="Signal description")

    @classmethod
    def from_info(cls, name: str, desc: str):
        return cls(name=name, description=desc)
