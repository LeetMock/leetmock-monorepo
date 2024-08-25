"use client";

import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { DEFAULT_CODE, LANGUAGES } from "@/lib/constants";
import { useTheme } from "next-themes";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { QuestionHolder } from "@/components/questions/QuestionHolder";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Toolbar } from "../_components/Toolbar";
import { ConnectionState } from "livekit-client";
import {
  useDataChannel,
  useLocalParticipant,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import { useConnectionState } from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";
import { useAgent } from "@/hooks/useAgent";
import { Transcripts } from "../_components/Transcripts";
import { LucideVolume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react"; // Import a loading icon
import { Clock } from "lucide-react"; // Import Clock icon
import { useCodingSession } from "@/hooks/useCodingSession";
import { Id } from "@/convex/_generated/dataModel";

const customEditorTheme: monacoEditor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#181a1f",
  },
};

const InterviewPage: React.FC = () => {
  const { theme } = useTheme();
  const { sessionId } = useParams<{ sessionId: Id<"sessions"> }>();

  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python");
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // LiveKit states
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const { connect, disconnect } = useConnection(room);
  const { localParticipant } = useLocalParticipant();

  // Agent & Interview states
  const { isAgentConnected, isAgentSpeaking } = useAgent();

  // Convex states
  const session = useQuery(api.sessions.getById, { sessionId });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });
  const editorSnapshot = useQuery(api.editorSnapshots.getLatestSnapshotBySessionId, { sessionId });

  // Set up the participant device
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, connectionState]);

  const handleConnect = useCallback(() => {
    if (
      connectionState === ConnectionState.Connecting ||
      connectionState === ConnectionState.Reconnecting
    ) {
      return;
    }

    if (connectionState === ConnectionState.Connected) {
      disconnect();
    } else {
      connect();
    }
  }, [connectionState, disconnect, connect]);

  const startInterview = useCallback(async () => {
    // TODO: move session creation to a separate place
  }, []);

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionTime(null); // Reset execution time

    const { language, content } = editorSnapshot!;

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
        setExecutionTime(data.executionTime);
        if (data.exception !== null) {
          const exceptionLines = data.exception.split("\n");
          setOutput(exceptionLines.slice(1).join("\n").trim());
          setIsError(true);
        } else {
          setOutput(data.stdout);
          setIsError(false);
        }
      } else {
        setOutput("Please Try Again Later");
        setIsError(true);
      }
    } catch (error) {
      console.error("Error running code:", error);
      setOutput("Error running code. Please try again.");
      setIsError(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <Toolbar />
      {!!session && !!question && !!editorSnapshot ? (
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
                  <Select value={editorSnapshot.language} onValueChange={onLanguageChange}>
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
                    language={editorSnapshot.language}
                    theme={theme === "dark" ? "customDarkTheme" : "vs-light"}
                    value={editorSnapshot.content}
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
                    onChange={(value) => onEditorContentChange(value || "")}
                    beforeMount={(monaco) => {
                      monaco.editor.defineTheme("customDarkTheme", customEditorTheme);
                      monaco.editor.setTheme("customDarkTheme");
                    }}
                  />
                </div>
                <div className="flex p-3 border-t flex-col space-y-2 min-h-[10rem]">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-primary font-medium">Output</p>
                    {executionTime !== null && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{executionTime} ms</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 rounded-md bg-secondary h-full">
                    <pre
                      className={`text-sm ${isError ? "text-red-500" : "text-gray-800 dark:text-gray-200"} p-1 rounded-md`}
                    >
                      <code>{output}</code>
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
        <div>Loading...</div>
      )}
    </div>
  );
};

export default InterviewPage;
