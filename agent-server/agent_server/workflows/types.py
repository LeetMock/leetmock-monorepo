from enum import Enum
from typing import Annotated, Any, Dict, List, TypeVar

from langchain_core.load.serializable import Serializable
from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages
from pydantic import BaseModel, Field

TState = TypeVar("TState", bound=BaseModel)
TMetadata = TypeVar("TMetadata", bound=BaseModel)


class SessionState(BaseModel):

    messages: Annotated[List[AnyMessage], add_messages] = Field(
        default_factory=list,
        description="Messages to be sent to the agent",
    )

    session_state: Dict[str, Any] = Field(
        default_factory=dict,
        description="Session state",
    )

    session_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Session metadata",
    )


class StageType(str, Enum):
    INTRO = "introduction"
    CODING = "coding"
    EVAL = "evaluation"
    END = "end"


class CodingEventType(str, Enum):
    """
    Events of coding interview system.
    """

    CODE_EDITOR_CONTENT_CHANGED = "code_editor_content_changed"
    USER_DEFINED_TEST_CASE_SET_UPDATED = "user_defined_test_cases_changed"
    USER_DEFINED_TEST_CASE_EXECUTED = "user_defined_test_case_executed"


class NamedEntity(Serializable):
    """Named entity."""

    name: str = Field(..., description="Name")

    @classmethod
    def is_lc_serializable(cls) -> bool:
        return True


class EventDescriptor(Serializable):
    name: CodingEventType
    description: str

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


EVENT_DESCRIPTORS = [
    EventDescriptor(
        name=CodingEventType.CODE_EDITOR_CONTENT_CHANGED,
        description="The candidate has changed the code in the editor (shown in diff format).",
    ),
    EventDescriptor(
        name=CodingEventType.USER_DEFINED_TEST_CASE_SET_UPDATED,
        description="The candidate has updated the user-defined test cases set.",
    ),
    EventDescriptor(
        name=CodingEventType.USER_DEFINED_TEST_CASE_EXECUTED,
        description="The candidate has executed the user-defined test cases. Results will be shown in the console.",
    ),
]
