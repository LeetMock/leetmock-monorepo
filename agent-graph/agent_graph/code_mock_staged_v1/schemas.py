from typing import List

from pydantic.v1 import BaseModel, Field


class TrackSteps(BaseModel):
    """Track which step(s) are completed based on the conversation history"""

    rationale: str = Field(
        ...,
        description="Step-by-step rationale for which step(s) are completed based on the conversation context",
    )

    steps: List[str] = Field(
        ...,
        description="List of step names that are completed, name should correspond to the step names",
    )


class TrackSignals(BaseModel):
    """Track which signal(s) are observed based on the conversation history"""

    rationale: str = Field(
        ...,
        description="Rationale for which signal(s) are observed based on the conversation context",
    )

    signals: List[str] = Field(
        ...,
        description="List of signal names that are observed, name should correspond to the signal names",
    )
