from convex_client.models import (
    RequestActionsGetSessionMetadata,
    RequestCodeSessionEventsCommitCodeSessionEventArgsEvent,
    RequestSessionsEndSessionArgs,
    ResponseActionsGetSessionMetadataValue,
    ResponseCodeSessionEventsGetNextEventBatchValueInner,
    ResponseCodeSessionStatesGetValue,
)

SessionMetadata = ResponseActionsGetSessionMetadataValue
CodeSessionState = ResponseCodeSessionStatesGetValue
CodeSessionEvent = RequestCodeSessionEventsCommitCodeSessionEventArgsEvent

RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs


def create_get_session_metadata_request(
    session_id: str,
) -> RequestGetSessionMetadata:
    args = RequestGetSessionMetadataArgs(sessionId=session_id)
    return RequestGetSessionMetadata(args=args)
