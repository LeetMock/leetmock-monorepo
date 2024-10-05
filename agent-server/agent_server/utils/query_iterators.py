import logging

from convex import ConvexError, QuerySubscription, QuerySetSubscription
from pydantic import BaseModel, Field, PrivateAttr
from convex_client import ApiClient, ActionApi, QueryApi, MutationApi, Configuration


logger = logging.getLogger("convex")


class AsyncQueryIterator(BaseModel):
    sub: QuerySubscription

    class Config:
        arbitrary_types_allowed = True

    def __aiter__(self):
        return self

    async def __anext__(self):
        result = await self.sub.safe_inner_sub().anext()
        if result["type"] == "convexerror":
            raise ConvexError(result["message"], result["data"])
        return result["value"]


class AsyncQuerySetIterator(BaseModel):
    sub: QuerySetSubscription

    class Config:
        arbitrary_types_allowed = True

    def __aiter__(self):
        return self

    async def __anext__(self):
        result = await self.sub.safe_inner_sub().anext()
        if not result:
            return result
        for k in result:
            result[k] = result[k]
        return result


class ConvexHttpClient(BaseModel):
    """ConvexHttpClient is a client for the Convex API."""

    convex_url: str = Field(..., description="The URL of the Convex instance")

    _query_api: QueryApi = PrivateAttr()

    _mutation_api: MutationApi = PrivateAttr()

    _action_api: ActionApi = PrivateAttr()

    @property
    def query(self) -> QueryApi:
        return self._query_api

    @property
    def mutation(self) -> MutationApi:
        return self._mutation_api

    @property
    def action(self) -> ActionApi:
        return self._action_api

    def __init__(self, convex_url: str):
        super().__init__(convex_url=convex_url)

        configuration = Configuration(host=self.convex_url)
        self._client = ApiClient(configuration)
        self._query_api = QueryApi(self._client)
        self._mutation_api = MutationApi(self._client)
        self._action_api = ActionApi(self._client)
