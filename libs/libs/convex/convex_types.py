from convex_client.models import (
    RequestActionsGetSessionMetadata,
    RequestActionsRunTests,
    RequestActionsRunTestsArgs,
    RequestSessionsEndSessionArgs,
    ResponseActionsGetSessionMetadataValue,
    ResponseCodeSessionEventsGetLatestContentChangeEventValue,
    ResponseCodeSessionStatesGetValue,
)

SessionMetadata = ResponseActionsGetSessionMetadataValue
CodeSessionState = ResponseCodeSessionStatesGetValue
CodeSessionContentChangedEvent = (
    ResponseCodeSessionEventsGetLatestContentChangeEventValue
)


RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs

RequestTestCodeCorrectness = RequestActionsRunTests
RequestTestCodeCorrectnessArgs = RequestActionsRunTestsArgs
