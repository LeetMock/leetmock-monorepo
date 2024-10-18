import logging

from convex import ConvexError, QuerySetSubscription, QuerySubscription
from pydantic import BaseModel

logger = logging.getLogger("convex")


class AsyncQueryGenerator(BaseModel):
    sub: QuerySubscription

    class Config:
        arbitrary_types_allowed = True

    @classmethod
    def from_subscription(cls, sub: QuerySubscription):
        return cls(sub=sub)

    def __aiter__(self):
        return self

    async def __anext__(self):
        result = await self.sub.safe_inner_sub().anext()
        if result["type"] == "convexerror":
            raise ConvexError(result["message"], result["data"])
        return result["value"]


class AsyncQuerySetGenerator(BaseModel):
    sub: QuerySetSubscription

    class Config:
        arbitrary_types_allowed = True

    @classmethod
    def from_subscription(cls, sub: QuerySetSubscription):
        return cls(sub=sub)

    def __aiter__(self):
        return self

    async def __anext__(self):
        result = await self.sub.safe_inner_sub().anext()
        if not result:
            return result
        for k in result:
            result[k] = result[k]
        return result
