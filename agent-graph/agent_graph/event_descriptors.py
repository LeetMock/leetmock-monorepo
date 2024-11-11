from enum import Enum

from pydantic.v1 import BaseModel


class CodingEventType(str, Enum):
    """
    Events of coding interview system.
    """

    CODE_EDITOR_CONTENT_CHANGED = "code_editor_content_changed"
    USER_DEFINED_TEST_CASE_SET_UPDATED = "user_defined_test_cases_changed"
    USER_DEFINED_TEST_CASE_EXECUTED = "user_defined_test_case_executed"


class EventDescriptor(BaseModel):
    name: CodingEventType
    description: str


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
