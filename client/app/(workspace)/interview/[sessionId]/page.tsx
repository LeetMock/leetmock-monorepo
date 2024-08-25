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
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toolbar } from "../_components/Toolbar";
import { ConnectionState } from "livekit-client";
import {
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";
import { useAgent } from "@/hooks/useAgent";
import { Transcripts } from "../_components/Transcripts";
import { LucideVolume2 } from "lucide-react";
import { cn, encode } from "@/lib/utils";
import { Loader2 } from "lucide-react"; // Import a loading icon
import { Clock } from "lucide-react"; // Import Clock icon
import { Id } from "@/convex/_generated/dataModel";
import { EditorState, useEditorState } from "@/hooks/useEditorState";
import { toast } from "sonner";

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
  const [editorInitialized, setEditorInitialized] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // LiveKit
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);
  const { localParticipant } = useLocalParticipant();
  const { send: sendSessionId } = useDataChannel("session-id");

  // Agent & Interview
  const [agentReceivedSessionId, setAgentReceivedSessionId] = useState(false);
  const { isAgentConnected, isAgentSpeaking } = useAgent();

  // Convex
  const createSnapshot = useMutation(api.editorSnapshots.create);
  const session = useQuery(api.sessions.getById, { sessionId });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });
  const initialEditorSnapshot = useQuery(api.editorSnapshots.getLatestSnapshotBySessionId, {
    sessionId,
  });

  // Handle snapshot changes on convex backend
  const handleSnapshotChanged = useCallback(
    (snapshot: EditorState) => {
      const promise = createSnapshot({
        sessionId,
        ...snapshot,
      });

      toast.promise(promise, {
        success: "Snapshot saved",
        error: "Error saving snapshot",
      });
    },
    [createSnapshot, sessionId]
  );

  const {
    editorState,
    setEditorState,
    isRunning,
    setIsRunning,
    onLanguageChange,
    onContentChange,
    onTerminalChange,
  } = useEditorState(handleSnapshotChanged);

  useEffect(() => {
    // Initialize the local editor state from the initial snapshot
    if (editorInitialized) return;
    if (!initialEditorSnapshot) return;

    const { editor, terminal } = initialEditorSnapshot;
    setEditorState({ editor, terminal });
    setEditorInitialized(true);
  }, [editorInitialized, initialEditorSnapshot, setEditorState]);

  useEffect(() => {
    // Setup the participant device
    if (connectionState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, connectionState]);

  useDataChannel("session-id-received", (message) => {
    console.log("Received session id", message);
    setAgentReceivedSessionId(true);
  });

  useEffect(() => {
    if (agentReceivedSessionId) return;

    if (connectionState === ConnectionState.Connected) {
      const interval = setInterval(() => {
        console.log("Sending session id", sessionId);
        sendSessionId(encode(sessionId), { reliable: true });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [agentReceivedSessionId, connectionState, sendSessionId, sessionId]);

  const handleConnect = useCallback(async () => {
    if (connectionState === ConnectionState.Connected) {
      disconnect();
    } else if (connectionState === ConnectionState.Disconnected) {
      await connect();
    }
  }, [connectionState, disconnect, connect]);

  const handleRunCode = async () => {
    const { language, content } = editorState.editor;
    setIsRunning(true);

    try {
      const response = await fetch("/api/runCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: content, language: language }),
      });

      const data = await response.json();
      if (data.status === "success") {
        const executionTime = data.executionTime;
        let output = "";
        let isError = false;

        if (data.exception !== null) {
          const exceptionLines = data.exception.split("\n");
          output = exceptionLines.slice(1).join("\n").trim();
          isError = true;
        } else {
          output = data.stdout;
          isError = false;
        }

        onTerminalChange({ output, isError, executionTime });
      } else {
        toast.error("Error running code. Please try again.");
      }
    } catch (error) {
      toast.error("Error running code. Please try again.");
    }

    setIsRunning(false);
  };

  return (
    <>
      <Toolbar />
      {!!session && !!question && editorInitialized ? (
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
                  <Button
                    className="w-20 h-8 relative"
                    onClick={handleRunCode}
                    disabled={isRunning}
                  >
                    {isRunning ? (
                      <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
                    ) : (
                      "Run"
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 h-full relative" ref={editorContainerRef}>
                  <Editor
                    className="absolute inset-0"
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
                <div className="flex p-3 border-t flex-col space-y-2 min-h-[10rem]">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-primary font-medium">Output</p>
                    {!isRunning && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{editorState.terminal.executionTime} ms</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 rounded-md bg-secondary h-full">
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
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
          <div className="w-[24rem] border-l h-full p-2 flex flex-col space-y-4">
            <Button
              className={cn(
                "w-full",
                "font-semibold",
                connectionState === ConnectionState.Disconnected &&
                  "bg-green-400 text-gray-900 hover:bg-green-500 transition-all",
                connectionState === ConnectionState.Connecting &&
                  "bg-gray-400 text-gray-900 hover:bg-gray-500 transition-all",
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
            <Transcripts />
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
