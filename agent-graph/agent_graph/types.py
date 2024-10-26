from pydantic.v1 import BaseModel, Field


class Task(BaseModel):
    """Agent task definition."""

    name: str = Field(..., description="Task name")

    description: str = Field(..., description="Task description")

    done_definition: str = Field(
        ..., description="Definition of when the task is considered done"
    )

    required: bool = Field(default=False, description="Whether the task is required")

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


class Observation(BaseModel):
    """Agent observation definition."""

    name: str = Field(..., description="Observation name")

    description: str = Field(..., description="Observation description")

    required: bool = Field(
        default=False, description="Whether the observation is required"
    )

    @classmethod
    def from_info(cls, name: str, desc: str, required: bool):
        return cls(name=name, description=desc, required=required)
