from typing import Generic, TypeVar, cast

from agent_server.contexts.session import CodeSession, CodeSessionEventTypes
from agent_server.events import SessionEvent
from pydantic import BaseModel, Field

TEvent = TypeVar("TEvent", bound=BaseModel)


class CodeSessionEvent(SessionEvent[TEvent, CodeSession], Generic[TEvent]):

    def start(self):
        session = self.session
        event_name = cast(CodeSessionEventTypes, self.event_name)
        session.on(event_name, lambda event: self.emit_event(event))
