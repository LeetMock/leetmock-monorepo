import { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";

export interface EditorState {
  editor: {
    language: string;
    content: string;
    lastUpdated: number;
  };
  terminal: {
    output: string;
    isError: boolean;
    executionTime?: number;
  };
}

const initialState: EditorState = {
  editor: {
    language: "python",
    content: "",
    lastUpdated: Date.now(),
  },
  terminal: {
    output: "",
    isError: false,
  },
};

export const useEditorState = (onChange: (state: EditorState) => void, delay: number = 1000) => {
  const [editorState, setEditorState] = useState<EditorState>(initialState);
  const [isRunning, setIsRunning] = useState(false);

  const onChangeDebounced = useDebounceCallback(onChange, delay);

  const handleStateChange = (state: EditorState, debounce: boolean = false) => {
    state.editor.lastUpdated = Date.now();
    setEditorState(state);
    debounce ? onChangeDebounced(state) : onChange(state);
  };

  const onLanguageChange = (language: string) => {
    handleStateChange({ ...editorState, editor: { ...editorState.editor, language } });
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
