from libs.convex.convex_types import (
    RequestGetSessionMetadata,
    RequestGetSessionMetadataArgs,
    RequestTestCodeCorrectness,
    RequestTestCodeCorrectnessArgs,
)


def create_get_session_metadata_request(
    session_id: str,
) -> RequestGetSessionMetadata:
    args = RequestGetSessionMetadataArgs(sessionId=session_id)
    return RequestGetSessionMetadata(args=args)


def create_test_code_correctness_request(
    language: str, code: str, question_id: str
) -> RequestTestCodeCorrectness:
    args = RequestTestCodeCorrectnessArgs(
        language=language, code=code, questionId=question_id
    )
    return RequestTestCodeCorrectness(args=args)
