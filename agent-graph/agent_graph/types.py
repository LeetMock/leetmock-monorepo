from pydantic.v1 import BaseModel, Field


class NamedEntity(BaseModel):
    """Named entity."""

    name: str = Field(..., description="Name")


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
