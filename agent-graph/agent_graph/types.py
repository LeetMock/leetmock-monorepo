from pydantic.v1 import BaseModel, Field


class Step(BaseModel):
    """Agent step definition."""

    name: str = Field(..., description="Step name")

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


class Signal(BaseModel):
    """Candidate signal definition."""

    name: str = Field(..., description="Signal name")

    description: str = Field(..., description="Observation description")

    required: bool = Field(
        default=False, description="Whether the observation is required"
    )

    @classmethod
    def from_info(cls, name: str, desc: str, required: bool):
        return cls(name=name, description=desc, required=required)
