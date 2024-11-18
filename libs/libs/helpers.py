
import tempfile
from mypy import api

def static_check_with_mypy(code: str) -> str:
    """Run static check with mypy.

    Args:
        code (str): The code to be static checked.

    Returns:
        str: The error report from mypy. If there is no error, the report is empty.
    """
    with tempfile.NamedTemporaryFile(mode="w", delete=True) as f:
        f.write(code)
        f.flush()
        stdin, stderr, code = api.run([f.name])
    if code != 0:
        return stdin + stderr
    else:
        return ""


if __name__ == "__main__":
    # test code
    code = """
from typing import List, Any

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
"""
    print(static_check_with_mypy(code))