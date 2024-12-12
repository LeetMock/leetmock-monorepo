import tempfile

from mypy import api


def static_check_with_mypy(code: str) -> str:
    """Run static check with mypy."""
    with tempfile.NamedTemporaryFile(mode="w", delete=True) as f:
        f.write(code)
        f.flush()
        stdin, stderr, exit_code = api.run([f.name])

    # pretty print all info
    print("mypy code: ", exit_code)
    print("mypy stdin: ", stdin)
    print("mypy stderr: ", stderr)

    if exit_code != 0:
        return stdin + stderr
    else:
        return "mypy passed"


if __name__ == "__main__":
    # test code
    code = """
from typing import List, Any
from collections import defaultdict

class Solution:
    def isSubsequence(self, s: str, t: str):
        # TODO: Write your Python code here
        dp = [[False]*(len(t)+1) for _ in range(len(s)+1)]
        for j in range(len(t)+1):
            dp[0][j] = True
        for i in range(1, len(s)+1):
            for j in range(1, len(t)+1):
                dp[i][j]=(dp[i-1][j-1] and s[i-1] == t[j-1]) or dp[i][j-1]

        return dp[-1][-1]

print(Solution().isSubsequence("abc", "ahbgdc"))
"""
    print(static_check_with_mypy(code))
