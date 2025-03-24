import { Doc, Id } from "@/convex/_generated/dataModel";

export interface Parameter {
    name: string;
    type: string;
}

export interface InputParameters {
    cpp: Record<string, string>;
    java: Record<string, string>;
    javascript: Record<string, string>;
    python: Record<string, string>;
    [key: string]: Record<string, string>;
}

export interface Testcase {
    input: any;
    output: any;
}

export interface Filters {
    search: string;
    category: string;
    difficulty: string;
}

export interface OutputTypeOption {
    value: string;
    label: string;
}

export interface TabValidation {
    basic: boolean;
    parameters: boolean;
    testcases: boolean;
    validation: boolean;
}

export type TabId = keyof TabValidation;

export interface BasicInfo {
    title: string;
    category: string;  // Will be comma-separated in the UI, converted to array on submit
    difficulty: number;
    functionName: string;
    question: string;
    companies: string;  // Will be comma-separated in the UI, converted to array on submit
    questionSets: string;  // Will be comma-separated in the UI, converted to array on submit
}

export type EvalMode = "exactMatch" | "listNodeIter" | "sortedMatch" | "compareInPlace";

export type QuestionDoc = Doc<"questions">; 