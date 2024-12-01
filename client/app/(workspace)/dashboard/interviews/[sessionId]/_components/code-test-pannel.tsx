"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CodeSessionEvent } from "@/convex/types";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useNonReactiveQuery } from "@/hooks/use-non-reactive-query";
import { Testcase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useConnectionState } from "@livekit/components-react";
import { useAction, useMutation, useQuery } from "convex/react";
import { Clock, Loader2, PlayIcon } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { TestResultsBlock } from "./test-results-block";
import { TestcaseEditor } from "./testcase-editor";

interface CodeTestPanelProps {
  sessionId: Id<"sessions">;
  questionId: Id<"questions">;
}

const language = "python";

export const CodeTestPanel: React.FC<CodeTestPanelProps> = ({ sessionId, questionId }) => {
  const connectionState = useConnectionState();

  const terminalState = useQuery(api.codeSessionStates.getTerminalState, { sessionId });
  const editorState = useNonReactiveQuery(api.codeSessionStates.getEditorState, { sessionId });
  const testCasesState = useNonReactiveQuery(api.codeSessionStates.getTestCasesState, {
    sessionId,
  }) as Testcase[];

  const commitCodeSessionEvent = useMutation(api.codeSessionEvents.commitCodeSessionEvent);
  const runTests = useAction(api.actions.runTests);

  const {
    testResults,
    outputView,
    testRunCounter,
    isRunning,
    savedTestcases,
    draftTestcases,
    activeTestcaseTab,
    setOutputView,
    updateDraft,
    saveDraft,
    handleRunTests,
    setActiveTestcaseTab,
    setTestcases,
  } = useEditorStore();

  useEffect(() => {
    if (testCasesState) {
      setTestcases(testCasesState);
    }
  }, [testCasesState, setTestcases]);

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
    <div className="w-full border flex-1 relative bg-background rounded-md min-h-0">
      <div className="flex flex-col absolute inset-0 overflow-auto">
        <div className="flex justify-between items-center px-3 py-3">
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
        <div className="px-2">
          <div className={cn(outputView === "testResults" ? "block" : "hidden")}>
            <TestResultsBlock
              key={testRunCounter}
              isRunning={isRunning}
              results={testResults ?? []}
            />
          </div>
          <div className={cn(outputView === "Testcase" ? "block" : "hidden")}>
            <TestcaseEditor
              testcases={draftTestcases}
              activeTab={activeTestcaseTab}
              connectionState={connectionState}
              onTestcasesChange={(testcases) => {
                updateDraft(testcases);
              }}
              onActiveTabChange={setActiveTestcaseTab}
              onSaveTestcases={() => {
                debouncedCommitEvent({
                  type: "testcase_changed",
                  data: {
                    before: savedTestcases,
                    after: draftTestcases,
                  },
                });
                saveDraft();
              }}
            />
          </div>
        </div>
        <div className="flex justify-end flex-1 p-3 items-end">
          <Button
            variant="outline-blue"
            className="h-8 min-w-24"
            onClick={() =>
              handleRunTests({
                sessionId,
                questionId,
                language,
                editorState,
                runTests,
                onCommitEvent: debouncedCommitEvent,
              })
            }
            disabled={isRunning || connectionState !== "connected"}
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
