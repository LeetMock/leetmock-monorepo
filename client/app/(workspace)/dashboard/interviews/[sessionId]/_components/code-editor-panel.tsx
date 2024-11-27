"use client";

import { useMutation, useQuery } from "convex/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { editor as monacoEditor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useDebounceCallback } from "usehooks-ts";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CodeSessionEvent } from "@/convex/types";
import { useNonReactiveQuery } from "@/hooks/use-non-reactive-query";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState } from "@livekit/components-react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";

const darkEditorTheme: monacoEditor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#181a1f",
  },
};

const language = "python";
const UNCONNECTED_MESSAGE = "You are not connected to the interview room.";

export interface CodeEditorPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId: Id<"sessions">;
  questionId: Id<"questions">;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  className,
  sessionId,
  questionId,
  ...props
}) => {
  const { theme } = useTheme();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const connectionState = useConnectionState();

  // Zustand store

  // Convex
  const editorState = useNonReactiveQuery(api.codeSessionStates.getEditorState, { sessionId });
  const terminalState = useQuery(api.codeSessionStates.getTerminalState, { sessionId });

  const commitCodeSessionEvent = useMutation(api.codeSessionEvents.commitCodeSessionEvent);

  const [localEditorContent, setLocalEditorContent] = useState<string | undefined>(undefined);

  // const { size, isResizing, resizeHandleProps } = useResizePanel({
  //   defaultSize: 400,
  //   minSize: 200,
  //   maxSize: Math.min(height - 250, 900),
  //   direction: "vertical",
  //   storageId: "leetmock.workspace.code-editor",
  // });

  useEffect(() => {
    if (!isDefined(editorState)) return;
    setLocalEditorContent(editorState.content);
  }, [editorState]);

  const stateLoaded = useMemo(
    () => isDefined(editorState) && isDefined(terminalState),
    [editorState, terminalState]
  );

  const handleCommitEvent = useCallback(
    (event: CodeSessionEvent) => {
      if (connectionState !== "connected") return;

      if (event.type === "testcase_changed") {
        toast.success("Testcases updated");
      }
      commitCodeSessionEvent({ sessionId, event });
    },
    [sessionId, commitCodeSessionEvent, connectionState]
  );

  const debouncedCommitEvent = useDebounceCallback(handleCommitEvent, 500);

  return (
    <div className={cn("h-full flex flex-col", className)} {...props}>
      <div
        className={cn(
          "flex flex-col justify-start w-full h-full border shrink-0",
          "bg-background rounded-md"
        )}
      >
        <div className="flex justify-between items-center px-2.5 py-2 border-b shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold mb-px">
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex-1 relative rounded-md pb-2 min-h-0" ref={editorContainerRef}>
          <Editor
            className="absolute inset-0"
            language={language}
            theme={theme === "dark" ? "customDarkTheme" : "vs-light"}
            value={editorState?.content || ""}
            options={{
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: connectionState !== "connected" || !stateLoaded,
              readOnlyMessage: {
                value: UNCONNECTED_MESSAGE,
                isTrusted: true,
              },
              minimap: {
                enabled: false,
              },
            }}
            onChange={(value) => {
              // Check for undefined values
              if (!isDefined(localEditorContent) || !isDefined(value)) return;
              if (connectionState !== "connected") return;
              if (localEditorContent === value) return;

              debouncedCommitEvent({
                type: "content_changed",
                data: { before: localEditorContent, after: value },
              });
              setLocalEditorContent(value);
            }}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme("customDarkTheme", darkEditorTheme);
              monaco.editor.setTheme("customDarkTheme");
            }}
          />
        </div>
      </div>
      {/* <div
        className={cn(
          "h-px w-full cursor-ns-resize py-1 transition-all hover:bg-muted-foreground/10 rounded-full relative",
          isResizing ? "bg-muted-foreground/10" : "bg-transparent"
        )}
        {...resizeHandleProps}
      >
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-9 h-[3px] rounded-full bg-muted-foreground/50" />
        </div>
      </div> */}
    </div>
  );
};
