from typing import Any, Dict, cast

from agent_graph.storages import StateStorage
from pydantic.v1 import Field

from libs.convex.api import ConvexApi


class ConvexStateStorage(StateStorage):
    """A state storage that fetches and updates the state from Convex."""

    session_id: str = Field(
        ..., description="The session id to fetch and update the state"
    )

    convex_api: ConvexApi = Field(..., description="The Convex API")

    class Config:
        arbitrary_types_allowed = True

    async def get_state(self) -> Dict[str, Any]:
        state = self.convex_api.query_unsafe(
            "agentStates:getBySessionId",
            {
                "sessionId": self.session_id,
            },
        )
        return cast(Dict, state)

    async def set_state(self, state: Dict[str, Any]):
        self.convex_api.mutation_unsafe(
            "agentStates:setBySessionId",
            {
                "sessionId": self.session_id,
                "state": state,
            },
        )
