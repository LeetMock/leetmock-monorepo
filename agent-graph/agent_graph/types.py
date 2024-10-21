from pydantic.v1 import BaseModel, Field


class Task(BaseModel):
    """Agent task definition."""

    name: str = Field(..., description="Task name")

    description: str = Field(..., description="Task description")

    required: bool = Field(default=False, description="Whether the task is required")

    @classmethod
    def from_info(cls, name: str, desc: str, required: bool = True):
        return cls(name=desc, description=desc, required=required)
