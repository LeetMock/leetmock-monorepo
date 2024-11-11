"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { Clock, Loader2, PlayIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { editor as monacoEditor } from "monaco-editor";
import { useTheme } from "next-themes";
import { useDebounceCallback } from "usehooks-ts";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CodeSessionEvent } from "@/convex/types";
import { useNonReactiveQuery } from "@/hooks/use-non-reactive-query";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { RunTestResult } from "@/lib/types";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState } from "@livekit/components-react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { TestResultsBlock } from "./test-results-block";

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

  // Convex
  const runTests = useAction(api.actions.runTests);
  const editorState = useNonReactiveQuery(api.codeSessionStates.getEditorState, { sessionId });
  const terminalState = useQuery(api.codeSessionStates.getTerminalState, { sessionId });
  const commitCodeSessionEvent = useMutation(api.codeSessionEvents.commitCodeSessionEvent);

  const [testResults, setTestResults] = useState<RunTestResult | null>(null);
  const [outputView, setOutputView] = useState<"output" | "testResults">("output");
  const [testRunCounter, setTestRunCounter] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [localEditorContent, setLocalEditorContent] = useState<string | undefined>(undefined);

  const { height = 300 } = useWindowSize();
  const { size, isResizing, resizeHandleProps } = useResizePanel({
    defaultSize: 400,
    minSize: 200,
    maxSize: Math.min(height - 250, 900),
    direction: "vertical",
    storageId: "leetmock.workspace.code-editor",
  });

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

      const promise = commitCodeSessionEvent({ sessionId, event });
      toast.promise(promise, {
        success: `Event ${event.type} committed`,
        error: "Error committing event",
      });
    },
    [sessionId, commitCodeSessionEvent, connectionState]
  );

  const debouncedCommitEvent = useDebounceCallback(handleCommitEvent, 500);

  const handleRunTests = async () => {
    if (!isDefined(editorState)) return;
    if (connectionState !== "connected") {
      toast.error(UNCONNECTED_MESSAGE);
      return;
    }

    const { language, content } = editorState;

    setIsRunning(true);
    setTestResults(null);
    setOutputView("testResults");
    setTestRunCounter((prev) => prev + 1);

    try {
      const result = await runTests({
        language,
        code: localEditorContent || content,
        questionId: questionId,
      });
      // const executionTime = result.executionTime;
      if (result.status === "success" && result.testResults) {
        const executionTime = result.executionTime;
        setTestResults(result.testResults);
      } else {
        const errorMessage =
          result.stderr || result.exception || "Error running tests. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error running tests:", error);
      toast.error("Error running tests. Please try again.");
    }

    setIsRunning(false);
  };

  return (
    <div className={cn("h-full w-full flex flex-col", className)} {...props}>
      <div
        className={cn(
          "flex flex-col justify-start w-full border shrink-0",
          "bg-background rounded-md shadow-md"
        )}
        style={{ height: size }}
      >
        <div className="flex justify-between items-center px-2.5 py-2 border-b">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold mb-px">
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          </div>
        </div>
        <div className="h-full relative rounded-md pb-2" ref={editorContainerRef}>
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
                value: "You are not connected to the interview room.",
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
      <div
        className={cn(
          "h-px w-full cursor-ns-resize py-1 transition-all hover:bg-muted-foreground/10 rounded-full relative",
          isResizing ? "bg-muted-foreground/10" : "bg-transparent"
        )}
        {...resizeHandleProps}
      >
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="w-9 h-[3px] rounded-full bg-muted-foreground/50"></div>
        </div>
      </div>
      <div
        className={cn(
          "flex px-3 py-2 flex-col space-y-2 h-full w-full border",
          "bg-background rounded-md shadow-md"
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOutputView("output")}
              className={cn(
                "text-sm font-medium",
                outputView === "output" ? "bg-secondary" : "hover:bg-secondary/50"
              )}
            >
              Output
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOutputView("testResults")}
              className={cn(
                "text-sm font-medium",
                outputView === "testResults" ? "bg-secondary" : "hover:bg-secondary/50"
              )}
            >
              Test Results
            </Button>
          </div>
          {!isRunning && outputView === "output" && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{terminalState ? terminalState.executionTime : 0} ms</span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-md bg-secondary h-full overflow-auto relative">
          {outputView === "testResults" && testResults ? (
            <TestResultsBlock key={testRunCounter} results={testResults} />
          ) : (
            <pre
              className={cn(
                "text-sm rounded-md absolute inset-3",
                terminalState?.isError ? "text-red-500" : "text-gray-800 dark:text-gray-200"
              )}
            >
              <code>{terminalState ? terminalState.output : ""}</code>
            </pre>
          )}
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline-blue"
            className="h-9 min-w-24"
            onClick={handleRunTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <PlayIcon className="h-3.5 w-3.5 mr-1" />
                <span>Test</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
