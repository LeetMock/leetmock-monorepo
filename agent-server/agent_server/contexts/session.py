import asyncio

from abc import ABC, abstractmethod
from typing import TypeVar

from agent_server.contexts.convex import ConvexApi
from livekit.agents.utils import EventEmitter

TEventTypes = TypeVar("TEventTypes", bound=str)


class BaseSession(EventEmitter[TEventTypes], ABC):
    """BaseSession is a base class for managing session state & sync with convex."""

    def __init__(self, api: ConvexApi):
        super().__init__()

        self._api = api
        self._synced: asyncio.Future[bool] = asyncio.Future()

    async def synced(self):
        """Wait for the session to be synced with convex."""
        return await self._synced

    async def update_state(self):
        """Update the session state to convex."""
        raise NotImplementedError

    @abstractmethod
    async def subscribe_state(self):
        """Subscribe to the session state from convex."""
        raise NotImplementedError


"""

v -> v1 -> v2

log 1 | log 2 | log 3 | ... | log k
                 |
                 v

compressed_state
version: int


"""
