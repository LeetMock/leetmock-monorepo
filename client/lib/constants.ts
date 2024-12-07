export interface Language {
  value: string;
  label: string;
}

export enum InterviewStage {
  Background = "background",
  Coding = "coding",
  Evaluation = "evaluation",
  End = "end",
}

export const STAGE_NAME_MAPPING: Record<InterviewStage, string> = {
  [InterviewStage.Background]: "Background Discussion",
  [InterviewStage.Coding]: "Coding",
  [InterviewStage.Evaluation]: "Evaluation",
  [InterviewStage.End]: "End",
};

export const LANGUAGES: Language[] = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

export const AVAILABLE_LANGUAGES = ["python"];
export const AVAILABLE_VOICES = ["Brian", "alloy"];

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
  (functionName: string, params: Record<string, string>): string;
}

export const CODE_PREFIX: { [key: string]: string } = {
  python:
    "from typing import List, Dict, Tuple, Optional, Union, Any\nimport math\nfrom data_structure import *\n",
  javascript: "",
  java: "",
  cpp: "",
};

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
`.trim(),
};

export const CODE_TEMPLATES: { [key: string]: CodeTemplate } = {
  python: (functionName, params) =>
    `
from typing import List, Any

class Solution:
    def ${functionName}(self, ${Object.entries(params)
      .map(([param, type]) => `${param}: ${type}`)
      .join(", ")}):
        # TODO: Write your Python code here
        pass
`.trim(),

  javascript: (functionName, params) =>
    `
class Solution {
    /**
     * @param {${Object.values(params).join("} @param {")}
     */
    ${functionName}(${Object.keys(params).join(", ")}) {
        // TODO: Write your JavaScript code here
    }
}
`.trim(),

  java: (functionName, params) =>
    `
import java.util.List;

class Solution {
    public Object ${functionName}(${Object.entries(params)
      .map(([param, type]) => `${type} ${param}`)
      .join(", ")}) {
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
    int ${functionName}(${Object.entries(params)
      .map(([param, type]) => `${type} ${param}`)
      .join(", ")}) {
        // TODO: Write your C++ code here
        return 0;
    }
};
`.trim(),
};

export const FREE_PLAN_MINUTES_ONLY_ONCE = 30;

export const PLANS: {
  [key: string]: { name: "free" | "basic" | "premium" | "enterprise"; minutes: number };
} = {
  free: {
    name: "free",
    minutes: 0,
  },
  basic: {
    name: "basic",
    minutes: 200,
  },
  premium: {
    name: "premium",
    minutes: 400,
  },
  enterprise: {
    name: "enterprise",
    minutes: 500,
  },
};

export const MINUTE_PRICE = 0.2;
export const MINUTE_PRICE_DISCOUNTED = 0.16;
