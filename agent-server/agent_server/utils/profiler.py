from __future__ import annotations

import asyncio
import json
import logging
import time
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import List, Literal

from pydantic.v1 import BaseModel, Field

logger = logging.getLogger(__name__)


def create_profiler_file_path(profiler_id: str) -> Path:
    return Path("./logs") / f"profiler_{profiler_id}.jsonl"


class Record(BaseModel):
    """
    A record of the time taken for a particular step.
    """

    type: Literal["record"] = "record"

    context: str = Field(description="The context of the record")

    name: str = Field(description="The name of the record")

    time: float = Field(description="The time taken for the record")


class Range(BaseModel):
    """A range represents start and end time of a particular step."""

    type: Literal["range"] = "range"

    context: str = Field(description="The context of the range")

    name: str = Field(description="The name of the range")

    start_time: float = Field(description="The start time of the range")

    end_time: float = Field(description="The end time of the range")


class RangeTracker(BaseModel):
    """A tracker for the range of a particular step."""

    context: str = Field(description="The context of the range")

    name: str = Field(description="The name of the range")

    profiler: Profiler = Field(description="The profiler of the range")

    start_time: float | None = Field(
        default=None, description="The start time of the range"
    )

    end_time: float | None = Field(
        default=None, description="The end time of the range"
    )

    def start(self):
        assert self.start_time is None

        self.start_time = time.time()

    def end(self):
        assert self.start_time is not None
        assert self.end_time is None

        self.end_time = time.time()

        self.profiler.records.append(
            Range(
                context=self.context,
                name=self.name,
                start_time=self.start_time,
                end_time=self.end_time,
            )
        )


class Profiler(BaseModel):
    """
    Profiler to log the time taken for each step of the agent.
    """

    profiler_id: str | None = Field(default=None, description="The id of the profiler")

    records: List[Record | Range] = Field(default_factory=list)

    curr_record_idx: int = Field(default=0)

    async def _main_task(self):
        while True:
            await asyncio.sleep(5)
            self.flush()

    def track(self, context: str, name: str | List[str]):
        current_time = time.time()

        if isinstance(name, list):
            for n in name:
                self.records.append(Record(context=context, name=n, time=current_time))
        else:
            self.records.append(Record(context=context, name=name, time=current_time))

    @contextmanager
    def range(self, context: str, name: str):
        start_time = time.time()
        yield
        end_time = time.time()
        self.records.append(
            Range(context=context, name=name, start_time=start_time, end_time=end_time)
        )

    def range_tracker(self, context: str, name: str):
        tracker = RangeTracker(context=context, name=name, profiler=self)
        return tracker

    def flush(self):
        if self.profiler_id is None:
            logger.info("Flushing profiler failed because profiler ID is not set")
            return

        path = create_profiler_file_path(self.profiler_id)

        with open(path, "a") as f:
            for i in range(self.curr_record_idx, len(self.records)):
                record_dict = self.records[i].dict()
                record_json = json.dumps(record_dict)
                f.write(record_json + "\n")

            self.curr_record_idx = len(self.records)

    def start(self):
        asyncio.create_task(self._main_task())


__profiler: Profiler | None = None


def set_profiler_id(profiler_id: str):
    pf = get_profiler()
    pf.profiler_id = profiler_id


def get_profiler() -> Profiler:
    global __profiler

    if __profiler is None:
        __profiler = Profiler()
    return __profiler


# After defining both RangeTracker and Profiler, update forward references
RangeTracker.update_forward_refs()
