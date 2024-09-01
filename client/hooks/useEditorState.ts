"use client";

import { useState, useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { CODE_TEMPLATES } from "@/lib/constants";
import { useCallback, useMemo } from "react";
import { useNonReactiveQuery } from "./useNonReactiveQuery";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { isDefined } from "@/lib/utils";

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

const defaultState: EditorState = {
  editor: {
    language: "python",
    content: "",
    lastUpdated: Date.now(),
    functionName: "",
    inputParameters: [],
  },
  terminal: {
    output: "",
    isError: false,
  },
};

const getInitialContent = ({
  language,
  functionName,
  inputParameters,
}: EditorState["editor"]): string => {
  return CODE_TEMPLATES[language](functionName, inputParameters);
};

const defaultOnChange = (state: EditorState) => {};

export const useEditorState = (
  sessionId: Id<"sessions">,
  onChange: (state: EditorState) => void = defaultOnChange,
  delay: number = 1000
) => {
  const initialEditorSnapshot = useNonReactiveQuery(
    api.editorSnapshots.getLatestSnapshotBySessionId,
    { sessionId }
  );

  const [initialized, setInitialized] = useState(false);
  const [localEditorState, setLocalEditorState] = useState<EditorState>(defaultState);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (!isDefined(initialEditorSnapshot)) return;

    const { terminal, editor } = initialEditorSnapshot;
    setLocalEditorState({ terminal, editor });
    setInitialized(true);
  }, [initialEditorSnapshot, initialized]);

  const editorState = useMemo(() => {
    return initialized ? localEditorState : undefined;
  }, [initialized, localEditorState]);

  const handleStateChange = useCallback(
    (state: EditorState) => {
      state.editor.lastUpdated = Date.now();
      setLocalEditorState(state);
      onChange(state);
    },
    [onChange]
  );

  const handleStateChangeDebounced = useDebounceCallback(handleStateChange, delay);

  const onLanguageChange = useCallback(
    (language: string) => {
      handleStateChange({
        ...localEditorState,
        editor: {
          ...localEditorState.editor,
          language,
          content: getInitialContent(localEditorState.editor),
        },
      });
    },
    [handleStateChange, localEditorState]
  );

  const onContentChange = useCallback(
    (content: string) => {
      handleStateChangeDebounced({
        ...localEditorState,
        editor: { ...localEditorState.editor, content },
      });
    },
    [handleStateChangeDebounced, localEditorState]
  );

  const onTerminalChange = useCallback(
    (terminal: EditorState["terminal"]) => {
      handleStateChange({ ...localEditorState, terminal });
    },
    [handleStateChange, localEditorState]
  );

  return {
    editorState,
    setEditorState: setLocalEditorState,
    isRunning,
    setIsRunning,
    onLanguageChange,
    onContentChange,
    onTerminalChange,
  };
};
