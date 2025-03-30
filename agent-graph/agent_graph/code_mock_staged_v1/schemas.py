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
