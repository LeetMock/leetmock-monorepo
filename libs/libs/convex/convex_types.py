from convex_client.models import (
    RequestActionsGetSessionMetadata,
    RequestActionsRunTests,
    RequestActionsRunTestsArgs,
    RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf5DataAfterInner,
    RequestSessionsEndSessionArgs,
    ResponseActionsGetSessionMetadataValue,
    ResponseActionsRunTestsValue,
    ResponseActionsRunTestsValueTestResultsInner,
    ResponseCodeSessionEventsGetLatestContentChangeEventValue,
    ResponseCodeSessionEventsGetLatestTestcaseChangeEventValue,
    ResponseCodeSessionEventsGetLatestUserTestcaseExecutedEventValue,
    ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValue,
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
CodeSessionGroundTruthTestcaseExecutedEvent = (
    ResponseCodeSessionEventsGetLatestGroundTruthTestcaseExecutedEventValue
)

RunTestsResult = ResponseActionsRunTestsValue
TestcaseResult = ResponseActionsRunTestsValueTestResultsInner
Testcase = RequestCodeSessionEventsCommitCodeSessionEventArgsEventOneOf5DataAfterInner

RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs

RequestTestCodeCorrectness = RequestActionsRunTests
RequestTestCodeCorrectnessArgs = RequestActionsRunTestsArgs
