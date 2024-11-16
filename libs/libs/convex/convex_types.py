from convex_client.models import (
    RequestActionsGetSessionMetadata,
    RequestActionsRunTests,
    RequestActionsRunTestsArgs,
    RequestSessionsEndSessionArgs,
    ResponseActionsGetSessionMetadataValue,
    ResponseActionsRunTestsValue,
    ResponseActionsRunTestsValueTestResultsInner,
    ResponseCodeSessionEventsGetLatestContentChangeEventValue,
    ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue,
    ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue,
    ResponseCodeSessionStatesGetValue,
)

SessionMetadata = ResponseActionsGetSessionMetadataValue
CodeSessionState = ResponseCodeSessionStatesGetValue
CodeSessionContentChangedEvent = (
    ResponseCodeSessionEventsGetLatestContentChangeEventValue
)
CodeSessionTestcaseChangedEvent = (
    ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue
)
CodeSessionUserTestcaseExecutedEvent = (
    ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue
)

RunTestsResult = ResponseActionsRunTestsValue
TestcaseResult = ResponseActionsRunTestsValueTestResultsInner

RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs

RequestTestCodeCorrectness = RequestActionsRunTests
RequestTestCodeCorrectnessArgs = RequestActionsRunTestsArgs
