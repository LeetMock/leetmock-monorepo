import os
from typing import Any, Dict, cast

from agent_server.storages import StateStorage
from langgraph_sdk import get_client
from pydantic.v1 import Field

LG_CLIENT = get_client(url=os.getenv("LANGGRAPH_API_URL"))


class LangGraphCloudStateStorage(StateStorage):
    """A state storage that fetches and updates the state from LangGraph Cloud."""

    thread_id: str = Field(
        ..., description="The thread id to fetch and update the state"
    )

    assistant_id: str = Field(
        ..., description="The assistant id to fetch and update the state"
    )

    async def get_state(self) -> Dict[str, Any]:
        snapshot = await LG_CLIENT.threads.get_state(thread_id=self.thread_id)
        values = cast(Dict[str, Any], snapshot["values"])
        return values

    async def set_state(self, state: Dict[str, Any]):
        await LG_CLIENT.runs.create(
            thread_id=self.thread_id,
            assistant_id=self.assistant_id,
            input=state,
            multitask_strategy="enqueue",
        )
