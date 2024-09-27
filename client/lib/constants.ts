export interface Language {
  value: string;
  label: string;
}

export const LANGUAGES: Language[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

export const VOICES: Language[] = [
  { value: "nova", label: "Nova" },
  { value: "alloy", label: "Alloy" },
  { value: "echo", label: "Echo" },
  { value: "fable", label: "Fable (British)" },
  { value: "onyx", label: "Onyx" },
  { value: "shimmer", label: "Shimmer" },
];

export const BG_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

interface CodeTemplate {
  (functionName: string, params: string[]): string;
}

export const DATA_STRUCTURES: { [key: string]: string } = {
  python: `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`.trim(),
  javascript: `
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`.trim(),
  java: `
public class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
`.trim(),
  cpp: `
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
`.trim()
};

export const CODE_TEMPLATES: { [key: string]: CodeTemplate } = {
  python: (functionName, params) =>
    `
from typing import List, Any

class Solution:
    def ${functionName}(self, ${params.filter((_, i) => i % 2 === 0).map((param, i) => `${param}: ${params[i * 2 + 1]}`).join(', ')}):
        # TODO: Write your Python code here
        pass
`.trim(),

  javascript: (functionName, params) =>
    `
class Solution {
    /**
     * @param {${params.filter((_, i) => i % 2 !== 0).join('} @param {')}
     */
    ${functionName}(${params.filter((_, i) => i % 2 === 0).join(", ")}) {
        // TODO: Write your JavaScript code here
    }
}
`.trim(),

  java: (functionName, params) =>
    `
import java.util.List;

class Solution {
    public Object ${functionName}(${params.filter((_, i) => i % 2 === 0).map((param, i) => `${params[i * 2 + 1]} ${param}`).join(', ')}) {
        // TODO: Write your Java code here
        return null;
    }
}
`.trim(),

  cpp: (functionName, params) =>
    `
#include <vector>
#include <string>

class Solution {
public:
    int ${functionName}(${params.filter((_, i) => i % 2 === 0).map((param, i) => `${params[i * 2 + 1]} ${param}`).join(', ')}) {
        // TODO: Write your C++ code here
        return 0;
    }
};
`.trim(),
};

export enum Topic {
  EditorState = "editor-state",
  Question = "question",
}
