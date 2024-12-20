from libs.convex.convex_types import (
    RequestCommitCodeSessionEvent,
    RequestCommitCodeSessionEventArgs,
    RequestGetSessionMetadata,
    RequestGetSessionMetadataArgs,
    RequestTestCodeCorrectness,
    RequestTestCodeCorrectnessArgs,
    RequestTestCodeWithGroundTruth,
    RequestTestCodeWithGroundTruthArgs,
)


def create_get_session_metadata_request(
    session_id: str,
) -> RequestGetSessionMetadata:
    args = RequestGetSessionMetadataArgs(sessionId=session_id)
    return RequestGetSessionMetadata(args=args)


def create_test_code_correctness_request(
    language: str, code: str, question_id: str, session_id: str
) -> RequestTestCodeCorrectness:
    args = RequestTestCodeCorrectnessArgs(
        language=language, questionId=question_id, sessionId=session_id
    )
    return RequestTestCodeCorrectness(args=args)


def create_commit_code_session_event_request(
    session_id: str, stage: str
) -> RequestCommitCodeSessionEvent:
    args = RequestCommitCodeSessionEventArgs.from_dict(
        {
            "sessionId": session_id,
            "event": {
                "type": "stage_switched",
                "data": {"stage": stage},
            },
        }
    )
    assert args is not None
    return RequestCommitCodeSessionEvent(args=args)


def create_test_code_with_ground_truth_request(
    language: str,
    code: str,
    question_id: str,
) -> RequestTestCodeWithGroundTruth:
    args = RequestTestCodeWithGroundTruthArgs.from_dict(
        {
            "language": language,
            "questionId": question_id,
            "code": code,
        }
    )
    assert args is not None
    return RequestTestCodeWithGroundTruth(args=args)
