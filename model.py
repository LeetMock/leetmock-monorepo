import json
import os
from enum import Enum
from pathlib import Path
from typing import Any, List, Literal, Type, TypeVar

from pydantic import BaseModel, Field, create_model

T = TypeVar("T", bound=BaseModel)


class JobType(Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"


class Profile(BaseModel):
    name: str
    age: int
    email: str
    phone: str
    address: str
    job_type: JobType


class ProfileList(BaseModel):
    profiles: List[Profile]


class Job(BaseModel):
    name: Any
    title: str
    description: str | None = None
    location: str | int
    job_type: JobType


class SoftwareEngineer(Job):
    name: Literal["Software Engineer"] = Field(default="Software Engineer")


class ElectricalEngineer(Job):
    name: str = Field(default="Electrical Engineer")


class JobList(BaseModel):
    jobs: List[ElectricalEngineer | SoftwareEngineer]


def generate_json_schema(model: Type[T]):
    return model.model_json_schema()


def camel_to_snake(name: str):
    return "".join(["_" + c.lower() if c.isupper() else c for c in name]).lstrip("_")


class AllModels(BaseModel):
    profile: Profile
    profile_list: ProfileList
    job: Job
    software_engineer: SoftwareEngineer
    electrical_engineer: ElectricalEngineer
    job_list: JobList


def main(path: Path):
    root_dir = path
    os.makedirs(root_dir, exist_ok=True)
    with open(root_dir / "full_schema.json", "w") as f:
        json.dump(AllModels.model_json_schema(), f)


if __name__ == "__main__":
    main(Path("schemas"))
