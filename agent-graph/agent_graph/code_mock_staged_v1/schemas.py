from typing import List

from pydantic import BaseModel, Field


class TrackStep(BaseModel):
    """Decide if the step has been completed by AI interviewer based on the conversation history"""

    thinking: str = Field(
        ...,
        description=(
            "Step-by-step thinking process for deciding if the step has been completed by AI interviewer. "
            "First, observing the conversation and decide if there is any information relevant to the step. "
            "Then, decide if the information is considered DONE based on the definition of done. "
            "Use bullet points to format your thought. "
            "Reasoning should be as concise as possible (no more than 5 bullet points)."
        ),
    )

    completed: bool = Field(
        ...,
        description="Based on the thought process, whether the step has been completed by AI interviewer",
    )


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

    # TODO: conversation suggestion


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

    # TODO: conversation suggestion


class ConfirmStageCompletion(BaseModel):
    """
    Confirm if the stage is completed based on the conversation history.

    Call this tool whenever the following three conditions are met:
    1. Interviewer prompted/asked candidate if he/she wants to move forward to the next stage.
    2. Candidate confirmed that he/she would like to move forward to the next stage.
    """

    pass


class ConfirmEndOfInterview(BaseModel):
    """
    Confirm if the interview session should be safely ended based on the conversation history.

    This tool should be only called after
    1. Interviewer has provided feedback to candidate.
    2. Candidate and interviewer say goodbye to each other, or some closing statements are made.
    """

    thought: str = Field(
        ...,
        description="Step-by-step thinking process for deciding if the interview session should be safely ended based on the conversation history",
    )

    should_end: bool = Field(
        ...,
        description="Whether the interview session should be safely ended based on the conversation history",
    )
