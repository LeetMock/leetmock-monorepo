import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useNonReactiveQuery } from "./use-non-reactive-query";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { isDefined } from "@/lib/utils";
import { CODE_TEMPLATES, LANGUAGES } from "@/lib/constants";

export interface CodeSessionState {
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

const getInitialContent = (language: string, functionName: string, params: string[]): string => {
  return CODE_TEMPLATES[language](functionName, params);
};

const defaultState: CodeSessionState = {
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

const defaultOnChange = (state: CodeSessionState) => {};

export const useCodeSessionState = (
  sessionId: Id<"sessions">,
  question: any | undefined,
  onChange: (state: CodeSessionState) => void = defaultOnChange,
  delay: number = 1000
) => {
  const initialSessionState = useNonReactiveQuery(
    api.codeSessionStates.getLatestSessionStateBySessionId,
    { sessionId }
  );

  const [initialized, setInitialized] = useState(false);
  const [localSessionState, setLocalSessionState] = useState<CodeSessionState>(defaultState);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (!isDefined(initialSessionState)) return;

    const { terminal, editor } = initialSessionState;
    const initialContent = editor.content;
    setLocalSessionState({
      terminal,
      editor: {
        ...editor,
        content: initialContent,
      },
    });
    setInitialized(true);
  }, [initialSessionState, initialized, question]);

  const handleStateChange = useCallback(
    (state: CodeSessionState) => {
      state.editor.lastUpdated = Date.now();
      setLocalSessionState(state);
      onChange(state);
    },
    [onChange]
  );

  const onLanguageChange = useCallback(
    (language: string) => {
      handleStateChange({
        ...localSessionState,
        editor: {
          ...localSessionState.editor,
          language,
          content: question
            ? getInitialContent(
                language,
                question.functionName || "",
                question.inputParameters?.[language] || []
              )
            : localSessionState.editor.content,
        },
      });
    },
    [handleStateChange, localSessionState, question]
  );

  const sessionState = useMemo(() => {
    return initialized ? localSessionState : undefined;
  }, [initialized, localSessionState]);

  const handleStateChangeDebounced = useDebounceCallback(handleStateChange, delay);

  const onContentChange = useCallback(
    (content: string) => {
      handleStateChangeDebounced({
        ...localSessionState,
        editor: { ...localSessionState.editor, content },
      });
    },
    [handleStateChangeDebounced, localSessionState]
  );

  const onTerminalChange = useCallback(
    (terminal: CodeSessionState["terminal"]) => {
      handleStateChange({ ...localSessionState, terminal });
    },
    [handleStateChange, localSessionState]
  );

  return {
    sessionState,
    setSessionState: setLocalSessionState,
    isRunning,
    setIsRunning,
    onLanguageChange,
    onContentChange,
    onTerminalChange,
  };
};
