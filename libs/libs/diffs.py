import difflib


def get_unified_diff(before: str, after: str, n_context_lines: int = 3) -> str:
    diff = difflib.unified_diff(
        before.splitlines(), after.splitlines(), n=n_context_lines, lineterm=""
    )
    return "\n".join(diff)
