from convex_client.models import (
    RequestActionsGetSessionMetadata,
    RequestActionsRunTests,
    RequestActionsRunTestsArgs,
    RequestSessionsEndSessionArgs,
    ResponseActionsGetSessionMetadataValue,
    ResponseActionsRunTestsValue,
    ResponseActionsRunTestsValueTestResultsInner,
    ResponseCodeSessionEventsGetLatestContentChangeEventValue,
    ResponseCodeSessionStatesGetValue,
)

SessionMetadata = ResponseActionsGetSessionMetadataValue
CodeSessionState = ResponseCodeSessionStatesGetValue
CodeSessionContentChangedEvent = (
    ResponseCodeSessionEventsGetLatestContentChangeEventValue
)

RunTestsResult = ResponseActionsRunTestsValue
TestcaseResult = ResponseActionsRunTestsValueTestResultsInner

RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs

RequestTestCodeCorrectness = RequestActionsRunTests
RequestTestCodeCorrectnessArgs = RequestActionsRunTestsArgs
