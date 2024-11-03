from typing import Any

from agent_server.events import BaseEvent
from langgraph.graph.state import CompiledStateGraph
from livekit.agents.voice_assistant import VoiceAssistant
from pydantic import BaseModel, Field, PrivateAttr

from libs.timestamp import Timestamp


class AgentStream(BaseModel):

    assistant: VoiceAssistant = Field(
        ..., description="The voice assistant to trigger the agent"
    )

    graph: CompiledStateGraph = Field(
        ..., description="The compiled state graph to trigger the agent"
    )

    async def send_event(self, event_name: str, data: Any) -> bool:
        # TODO: send event to langgraph, check if graph should be triggered
        return True

    async def trigger(self, timestamp: Timestamp):
        start_t = timestamp.t
        # TODO: run langgraph, stop when graph is done or interrupted
        pass

    async def sync_state(self, timestamp: Timestamp):
        # TODO: sync latest state to convex
        pass
