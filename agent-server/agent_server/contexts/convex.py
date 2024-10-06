from convex import ConvexClient, FunctionArgs, QuerySubscription
from pydantic import BaseModel, Field, PrivateAttr
from convex_client import QueryApi, MutationApi, ActionApi, Configuration, ApiClient


class ConvexApi(BaseModel):
    """ConvexApi manages the Convex http apis and subscriptions."""

    convex_url: str = Field(..., description="The URL of the Convex instance")

    _convex_client: ConvexClient = PrivateAttr()

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

    def subscribe(self, query: str, params: FunctionArgs) -> QuerySubscription:
        return self._convex_client.subscribe(query, params)

    def __init__(self, convex_url: str):
        super().__init__(convex_url=convex_url)

        configuration = Configuration(host=self.convex_url)

        self._client = ApiClient(configuration)
        self._query_api = QueryApi(self._client)
        self._mutation_api = MutationApi(self._client)
        self._action_api = ActionApi(self._client)
        self._convex_client = ConvexClient(convex_url)
