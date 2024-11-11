import time

from pydantic import BaseModel, PrivateAttr


def unix_timestamp():
    return int(time.time())


class Timestamp(BaseModel):
    """A timestamp object"""

    _timestamp: int = PrivateAttr(default_factory=unix_timestamp)

    def refresh(self):
        self._timestamp = unix_timestamp()

    @property
    def t(self):
        return self._timestamp
