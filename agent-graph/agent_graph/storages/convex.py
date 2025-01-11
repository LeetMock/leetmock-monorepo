import logging
from typing import Any, Dict, Type, cast

from agent_graph.storages import StateStorage
from agent_graph.utils import get_state_graph_initial_state_dict
from langchain_core.load import dumps, loads
from pydantic import BaseModel, Field

from libs.convex.api import ConvexApi
from libs.convex.convex_requests import (
    create_get_agent_state_by_session_id_request,
    create_set_agent_state_by_session_id_request,
)

logger = logging.getLogger(__name__)


class ConvexStateStorage(StateStorage):
    """A state storage that fetches and updates the state from Convex."""

    session_id: str = Field(
        ..., description="The session id to fetch and update the state"
    )

    state_type: Type[BaseModel] = Field(..., description="The state type")

    convex_api: ConvexApi = Field(..., description="The Convex API")

    class Config:
        arbitrary_types_allowed = True

    async def get_state(self) -> Dict[str, Any]:
        logger.info(f"Getting convex agent state for session {self.session_id}")
        state = self.convex_api.query.api_run_agent_states_get_by_session_id_post(
            create_get_agent_state_by_session_id_request(self.session_id)
        )
        assert state.value is not None, "State is not found"

        if state.value.state is None:
            logger.info(
                f"State for session {self.session_id} is not found, returning initial state",
            )
            return get_state_graph_initial_state_dict(self.state_type)

        return loads(state.value.state, valid_namespaces=["agent_graph"])

    async def set_state(self, state: Dict[str, Any]):
        logger.info(f"Setting convex agent state for session {self.session_id}")
        self.convex_api.mutation.api_run_agent_states_set_by_session_id_post(
            create_set_agent_state_by_session_id_request(
                session_id=self.session_id, state=dumps(state)
            )
        )
