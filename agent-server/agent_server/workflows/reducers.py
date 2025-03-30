from typing import Any, List


def merge_unique(left: List[Any] | Any, right: List[Any] | Any) -> List[Any]:
    assert left is not None and right is not None

    if not isinstance(left, list):
        left = [left]
    if not isinstance(right, list):
        right = [right]

    return list(set(left + right))
