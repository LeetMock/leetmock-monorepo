import { useState, useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { CODE_TEMPLATES, LANGUAGES } from "@/lib/constants";
import { StringToBoolean } from "class-variance-authority/types";

export interface EditorState {
  editor: {
    language: string;
    content: string;
    lastUpdated: number;
    functionName: string;
    inputParameters: string[];
  };
  terminal: {
    output: string;
    isError: boolean;
    executionTime?: number;
  };
}

const getInitialContent = (language: string, functionName: string, params: string[]): string => {
  return CODE_TEMPLATES[language](functionName, params);
};

export const useEditorState = (
  onChange: (state: EditorState) => void,
  initialFunctionName: string = "solution",
  initialParams: string[] = [],
  delay: number = 1000
) => {
  const [editorState, setEditorState] = useState<EditorState>(() => {
    // Initialize the state with the default values
    return {
      editor: {
        language: LANGUAGES[0].value,
        content: getInitialContent(LANGUAGES[0].value, initialFunctionName, initialParams),
        lastUpdated: Date.now(),
        functionName: initialFunctionName, // Added functionName
        inputParameters: initialParams, // Added inputParameters
      },
      terminal: {
        output: "",
        isError: false,
      },
    };
  });

  const [isRunning, setIsRunning] = useState(false);

  const onChangeDebounced = useDebounceCallback(onChange, delay);

  const handleStateChange = (state: EditorState, debounce: boolean = false) => {
    state.editor.lastUpdated = Date.now();
    setEditorState(state);
    debounce ? onChangeDebounced(state) : onChange(state);
  };

  const onLanguageChange = (language: string) => {
    handleStateChange({
      ...editorState,
      editor: {
        ...editorState.editor,
        language,
        content: getInitialContent(language, editorState.editor.functionName, editorState.editor.inputParameters), // Use current functionName and inputParameters
      },
    });
  };

  const onContentChange = (content: string) => {
    handleStateChange({ ...editorState, editor: { ...editorState.editor, content } }, true);
  };

  const onTerminalChange = (terminal: EditorState["terminal"]) => {
    handleStateChange({ ...editorState, terminal });
  };

  return {
    editorState,
    setEditorState,
    isRunning,
    setIsRunning,
    onLanguageChange,
    onContentChange,
    onTerminalChange,
  };
};
