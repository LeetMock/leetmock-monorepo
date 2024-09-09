"use client";

import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";
import { useTheme } from "next-themes";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { QuestionHolder } from "@/components/questions/QuestionHolder";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toolbar } from "../_components/Toolbar";
import { ConnectionState } from "livekit-client";
import { useConnectionState, useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";
import { useAgent } from "@/hooks/useAgent";
import { Transcripts } from "../_components/Transcripts";
import { TestResultsBlock } from "../_components/TestResultsBlock";
import { LucideVolume2, PlayCircle, TestTube2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { EditorState, useEditorState } from "@/hooks/useEditorState";
import { toast } from "sonner";
import { RunTestResult } from "@/lib/types";

const customEditorTheme: monacoEditor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#181a1f",
  },
};

const InterviewWorkspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  const { theme } = useTheme();
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // LiveKit
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);
  const { localParticipant } = useLocalParticipant();
  const { isAgentConnected, isAgentSpeaking, agentAudioTrack } = useAgent(sessionId);

  // Convex
  const createSnapshot = useMutation(api.editorSnapshots.create);
  const runTests = useAction(api.actions.runTests);
  const runCode = useAction(api.actions.runCode);
  const session = useQuery(api.sessions.getById, { sessionId });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });

  const [testResults, setTestResults] = useState<RunTestResult | null>(null);
  const [outputView, setOutputView] = useState<"output" | "testResults">("output");
  const [testRunCounter, setTestRunCounter] = useState(0);

  const handleSnapshotChange = useCallback(
    (snapshot: EditorState) => {
      const promise = createSnapshot({ sessionId, ...snapshot });
      toast.promise(promise, {
        success: "Snapshot saved",
        error: "Error saving snapshot",
      });
    },
    [sessionId, createSnapshot]
  );

  const {
    editorState,
    isRunning,
    setIsRunning,
    onLanguageChange,
    onContentChange,
    onTerminalChange,
  } = useEditorState(sessionId, handleSnapshotChange);

  // Setup the participant device
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, connectionState]);

  // Connect to the room
  const handleConnect = useCallback(async () => {
    if (connectionState === ConnectionState.Connected) {
      disconnect();
    } else if (connectionState === ConnectionState.Disconnected) {
      await connect();
    }
  }, [connectionState, disconnect, connect]);

  const handleRunCode = async () => {
    const { language, content } = editorState!.editor;
    setIsRunning(true);
    try {
      const result = await runCode({ language, code: content });

      if (result && result.status) {
        const { executionTime, isError, output } = result;
        onTerminalChange({ output, isError, executionTime });
      } else {
        toast.error("Error running code. Please try again.");
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Error running code. Please try again.");
    }

    setIsRunning(false);
  };

  const handleRunTests = async () => {
    const { language, content } = editorState!.editor;
    setIsRunning(true);
    setTestResults(null);
    setOutputView("testResults");
    setTestRunCounter((prev) => prev + 1);

    try {
      if (!session?.questionId) {
        throw new Error("Question ID not found");
      }
      const result = await runTests({ language, code: content, questionId: session.questionId });

      if (result.status === "success" && result.testResults) {
        const executionTime = result.executionTime;
        setTestResults(result.testResults);
        const allPassed = result.testResults.every((testCase) => testCase.passed);

        onTerminalChange({
          output: allPassed
            ? "All test cases passed!"
            : "Some test cases failed. See details above.",
          isError: !allPassed,
          executionTime,
        });
      } else {
        const errorMessage =
          result.stderr || result.exception || "Error running tests. Please try again.";
        onTerminalChange({
          output: errorMessage,
          isError: true,
          executionTime: result.executionTime,
        });
      }
    } catch (error) {
      console.error("Error running tests:", error);
      onTerminalChange({
        output: "Error running tests. Please try again.",
        isError: true,
        executionTime: 0,
      });
    }

    setIsRunning(false);
  };

  return (
    <>
      <Toolbar />
      {!!session && !!question && !!editorState ? (
        <div className="w-full h-full flex justify-center items-center">
          <ResizablePanelGroup direction="horizontal" className="w-full h-full">
            <ResizablePanel className="min-w-[5rem] h-full w-full relative">
              <div className="absolute inset-0 overflow-y-auto overflow-auto">
                {question ? (
                  <QuestionHolder
                    question_title={question.title}
                    question_description={question.question}
                  />
                ) : (
                  <div>Loading question...</div>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className="min-w-[20rem]">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={75} minSize={30}>
                  <div className="flex flex-col justify-start h-full w-full">
                    <div className="flex justify-between items-center p-2 border-b">
                      <Select value={editorState.editor.language} onValueChange={onLanguageChange}>
                        <SelectTrigger className="w-36 h-8">
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex space-x-2">
                        <Button
                          className="w-28 h-8 relative"
                          onClick={handleRunCode}
                          disabled={isRunning}
                        >
                          {isRunning ? (
                            <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Run Code
                            </>
                          )}
                        </Button>
                        <Button
                          className="w-28 h-8 relative"
                          onClick={handleRunTests}
                          disabled={isRunning}
                        >
                          {isRunning ? (
                            <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <TestTube2 className="w-4 h-4 mr-1" />
                              Run Tests
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="bg-blue-50 h-full relative" ref={editorContainerRef}>
                      <Editor
                        className="absolute inset-0 bg-background"
                        language={editorState.editor.language}
                        theme={theme === "dark" ? "customDarkTheme" : "vs-light"}
                        value={editorState.editor.content}
                        options={{
                          fontSize: 14,
                          lineNumbers: "on",
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          readOnly: false,
                          minimap: {
                            enabled: false,
                          },
                        }}
                        onChange={(value) => onContentChange(value || "")}
                        beforeMount={(monaco) => {
                          monaco.editor.defineTheme("customDarkTheme", customEditorTheme);
                          monaco.editor.setTheme("customDarkTheme");
                        }}
                      />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={10}>
                  <div className="flex p-3 border-t flex-col space-y-2 h-full">
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
                          <span>{editorState.terminal.executionTime} ms</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 rounded-md bg-secondary h-full overflow-auto">
                      {outputView === "testResults" && testResults ? (
                        <TestResultsBlock key={testRunCounter} results={testResults} />
                      ) : (
                        <pre
                          className={cn(
                            "text-sm p-1 rounded-md",
                            editorState.terminal.isError
                              ? "text-red-500"
                              : "text-gray-800 dark:text-gray-200"
                          )}
                        >
                          <code>{editorState.terminal.output}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
          <div className="w-[24rem] border-l h-full p-2 flex flex-col space-y-4">
            <Button
              className={cn(
                "w-full font-semibold text-white",
                connectionState === ConnectionState.Disconnected &&
                  "bg-green-500 hover:bg-green-600 transition-all",
                connectionState === ConnectionState.Connecting &&
                  "bg-gray-400 hover:bg-gray-500 transition-all",
                connectionState === ConnectionState.Connected &&
                  "bg-red-500 text-white hover:bg-red-600 transition-all"
              )}
              variant={connectionState === ConnectionState.Connected ? "destructive" : "secondary"}
              disabled={connectionState === ConnectionState.Connecting}
              onClick={handleConnect}
            >
              {connectionState === ConnectionState.Connected ? (
                "Disconnect"
              ) : connectionState === ConnectionState.Connecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect</>
              )}
            </Button>
            <div className="mt-4 p-3 border rounded-md">
              <div className="text-sm font-medium flex justify-between items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <span>Agent Status:</span>
                  {isAgentConnected ? (
                    <span className="text-green-500 mt-[1px]">Connected</span>
                  ) : (
                    <span className="text-red-500 mt-[1px]">Disconnected</span>
                  )}
                </div>
                <LucideVolume2
                  className={cn(
                    "w-4 h-4 opacity-0 text-blue-500",
                    isAgentSpeaking ? "opacity-100" : ""
                  )}
                />
              </div>
            </div>
            <Transcripts agentAudioTrack={agentAudioTrack} />
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}
    </>
  );
};

const InterviewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionExists = useQuery(api.sessions.exists, { sessionId });
  const sessions = useQuery(api.sessions.getByUserId, {
    userId: "user_2l0CgXdHXXShSwtApSLaRxfs1yc",
  });
  console.log(sessions);
  const interviewWorkspace = useMemo(() => {
    if (sessionExists === undefined) {
      return <div>Loading...</div>;
    }

    if (sessionExists === false) {
      return <div>Session not found</div>;
    }

    return <InterviewWorkspace sessionId={sessionId as Id<"sessions">} />;
  }, [sessionExists, sessionId]);

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      {interviewWorkspace}
    </div>
  );
};

export default InterviewPage;
