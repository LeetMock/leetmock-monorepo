from convex_client.models import (
    ResponseActionsGetSessionMetadataValue,
    RequestEditorSnapshotsCreateArgs,
    RequestActionsGetSessionMetadata,
    RequestSessionsEndSessionArgs,
)


SessionMetadata = ResponseActionsGetSessionMetadataValue
EditorSnapshot = RequestEditorSnapshotsCreateArgs

RequestGetSessionMetadata = RequestActionsGetSessionMetadata
RequestGetSessionMetadataArgs = RequestSessionsEndSessionArgs


def create_get_session_metadata_request(
    session_id: str,
) -> RequestGetSessionMetadata:
    args = RequestGetSessionMetadataArgs(sessionId=session_id)
    return RequestGetSessionMetadata(args=args)
