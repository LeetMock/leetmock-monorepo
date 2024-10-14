from convex_client.models import (
    ResponseActionsGetSessionMetadataValue,
    ResponseActionsGetEditorSnapshotValue,
    RequestActionsGetSessionMetadata,
    RequestSessionsEndSessionArgs,
)


SessionMetadata = ResponseActionsGetSessionMetadataValue
EditorSnapshot = ResponseActionsGetEditorSnapshotValue

RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs


def create_get_session_metadata_request(
    session_id: str,
) -> RequestGetSessionMetadata:
    args = RequestGetSessionMetadataArgs(sessionId=session_id)
    return RequestGetSessionMetadata(args=args)
