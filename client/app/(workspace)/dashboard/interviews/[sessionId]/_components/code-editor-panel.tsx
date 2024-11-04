"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { Clock, Loader2, PlayIcon } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";

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
import { TestcaseEditor } from './testcase-editor';
import { Testcase } from "@/lib/types";
import { useEditorStore } from "@/hooks/use-editor-store";


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
  const {
    testResults,
    outputView,
    testRunCounter,
    isRunning,
    localTestcases,
    activeTestcaseTab,
    hasTestcaseChanges,
    setOutputView,
    setLocalTestcases,
    setActiveTestcaseTab,
    handleRunTests,
    setHasTestcaseChanges
  } = useEditorStore();

  // Convex
  const editorState = useNonReactiveQuery(api.codeSessionStates.getEditorState, { sessionId });
  const terminalState = useQuery(api.codeSessionStates.getTerminalState, { sessionId });
  const testCasesState = useNonReactiveQuery(api.codeSessionStates.getTestCasesState, { sessionId }) as Testcase[];
  const commitCodeSessionEvent = useMutation(api.codeSessionEvents.commitCodeSessionEvent);

  const { height } = useWindowSize();
  const { size, isResizing, resizeHandleProps } = useResizePanel({
    defaultSize: 400,
    minSize: 200,
    maxSize: Math.min(height - 250, 900),
    direction: "vertical",
    storageId: "leetmock.workspace.code-editor",
  });

  const stateLoaded = useMemo(
    () => isDefined(editorState) && isDefined(terminalState) && isDefined(testCasesState),
    [editorState, terminalState, testCasesState]
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

  useEffect(() => {
    if (testCasesState) {
      setLocalTestcases(testCasesState);
    }
  }, [testCasesState, setLocalTestcases]);

  const runTests = useAction(api.actions.runTests);

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
            value={editorState ? editorState.content : ""}
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
            onChange={(value) =>
              debouncedCommitEvent({
                type: "content_changed",
                data: { content: value || "" },
              })
            }
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
          "flex flex-col space-y-2 w-full border overflow-hidden",
          "bg-background rounded-md shadow-md"
        )}
        style={{ height: `calc(100% - ${size}px - 2px)` }}
      >
        <div className="flex justify-between items-center px-3 py-2">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOutputView("Testcase")}
              className={cn(
                "text-sm font-medium",
                outputView === "Testcase" ? "bg-secondary" : "hover:bg-secondary/50"
              )}
            >
              Testcase
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
          {!isRunning && outputView === "testResults" && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{terminalState ? terminalState.executionTime : 0} ms</span>
            </div>
          )}
        </div>
        <div className="flex-grow overflow-auto px-2">
          <div className="h-full p-2 rounded-md bg-secondary/10 relative">
            <div className={cn(outputView === "testResults" ? "block" : "hidden")}>
              <TestResultsBlock key={testRunCounter} isRunning={isRunning} results={testResults ?? []} />
            </div>
            <div className={cn(outputView === "Testcase" ? "block" : "hidden")}>
              <TestcaseEditor
                testcases={localTestcases}
                activeTab={activeTestcaseTab}
                connectionState={connectionState}
                onTestcasesChange={(testcases) => {
                  setLocalTestcases(testcases);
                  // console.log("hasTestcaseChanges", hasTestcaseChanges);
                }}
                onActiveTabChange={setActiveTestcaseTab}
                onSaveTestcases={() => {
                  debouncedCommitEvent({
                    type: "testcase_changed",
                    data: { content: localTestcases }
                  });
                  setHasTestcaseChanges(false);
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end px-3 pb-2">
          <Button
            variant="outline-blue"
            className="h-9 min-w-24"
            onClick={() => handleRunTests({
              sessionId,
              questionId,
              language,
              editorState,
              runTests,
              onCommitEvent: debouncedCommitEvent
            })}
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
