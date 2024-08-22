export interface Language {
  value: string;
  label: string;
}

export const LANGUAGES: Language[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
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

export const DEFAULT_CODE: string = `def main():\n\t# TODO: Write your code here\n\tpass`;

export enum Topic {
  EditorState = "editor-state",
  Question = "question",
}
