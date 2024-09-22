import { IoLogoPython } from "react-icons/io5";
import { PiFileCppFill } from "react-icons/pi";
import { FaJava } from "react-icons/fa6";
import { IoLogoJavascript } from "react-icons/io5";
import { SiTypescript } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";

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

export const LANG_ICONS = {
  python: IoLogoPython,
  cpp: PiFileCppFill,
  java: FaJava,
  javascript: IoLogoJavascript,
  typescript: SiTypescript,
  golang: FaGolang,
};

interface CodeTemplate {
  (functionName: string, params: string[]): string;
}

const typeMap = {
  python: {
    string: "str",
    int: "int",
    list: "List[Any]",
    boolean: "bool",
    float: "float",
  },
  java: {
    string: "String",
    int: "int",
    list: "List<Object>",
    boolean: "boolean",
    float: "float",
  },
  cpp: {
    string: "string",
    int: "int",
    list: "vector<void*>",
    boolean: "bool",
    float: "float",
  },
} as const;

export const CODE_TEMPLATES: { [key: string]: CodeTemplate } = {
  python: (functionName, params) =>
    `
from typing import List, Any

class Solution:
    def ${functionName}(self, ${params
      .filter((_, i) => i % 2 === 0)
      .map((param, i) => {
        const type = params[i * 2 + 1].toLowerCase();
        return `${param}: ${typeMap.python[type as keyof typeof typeMap.python] || params[i * 2 + 1]}`;
      })
      .join(", ")}):
        # TODO: Write your Python code here
        pass
`.trim(),

  javascript: (functionName, params) =>
    `
class Solution {
    /**
     * @param {${params
       .filter((_, i) => i % 2 !== 0)
       .map((type) =>
         type.toLowerCase() === "list"
           ? "any[]"
           : type.toLowerCase() === "string"
             ? "string"
             : type.toLowerCase() === "int"
               ? "number"
               : type.toLowerCase() === "boolean"
                 ? "boolean"
                 : type.toLowerCase() === "float"
                   ? "number"
                   : type
       )
       .join("} @param {")}
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
    public Object ${functionName}(${params
      .filter((_, i) => i % 2 === 0)
      .map((param, i) => {
        const type = params[i * 2 + 1].toLowerCase();
        return `${typeMap.java[type as keyof typeof typeMap.java] || params[i * 2 + 1]} ${param}`;
      })
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
    int ${functionName}(${params
      .filter((_, i) => i % 2 === 0)
      .map((param, i) => {
        const type = params[i * 2 + 1].toLowerCase();
        return `${typeMap.cpp[type as keyof typeof typeMap.cpp] || params[i * 2 + 1]}${type === "list" ? "" : "*"} ${param}`;
      })
      .join(", ")}) {
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
