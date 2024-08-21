"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
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
import { useQuery } from "convex/react";
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
import { useCodingInterview } from "@/hooks/useCodingInterview";

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
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const questionId = parseInt(params.question_id as string, 10);
  const question = useQuery(api.questions.getByQuestionId, { question_id: questionId });

  // LiveKit states
  const room = useRoomContext();
  const { connect, disconnect } = useConnection(room);
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();

  // Agent & Interview states
  const { isAgentConnected, isAgentSpeaking } = useAgent();
  const { language, editorContent, onEditorContentChange, onLanguageChange } = useCodingInterview({
    language: "python",
    editorContent: DEFAULT_CODE,
    connectionState: connectionState,
  });

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, connectionState]);

  const handleConnect = () => {
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
  };

  // Check if the conversion was successful
  if (isNaN(questionId)) {
    console.error("Invalid question_id:", params.question_id);
    // Handle the error appropriately, e.g., show an error message or redirect
    return <div>Invalid question ID</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <Toolbar />
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
                <Select value={language} onValueChange={onLanguageChange}>
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
                <Button className="w-20 h-8">Run</Button>
              </div>
              <div className="bg-blue-50 h-full relative" ref={editorContainerRef}>
                <Editor
                  className="absolute inset-0"
                  language={language}
                  theme={theme === "dark" ? "customDarkTheme" : "vs-light"}
                  value={editorContent}
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
                <p className="text-sm text-primary font-medium">Output</p>
                <div className="p-2 rounded-md bg-secondary h-full">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 p-1 rounded-md">
                    <code>console.log(Hello, world!);</code>
                  </pre>
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
        <div className="w-[24rem] border-l h-full p-2 flex flex-col space-y-4">
          <Button
            className="w-full"
            variant={connectionState === ConnectionState.Connected ? "destructive" : "secondary"}
            disabled={connectionState === ConnectionState.Connecting}
            onClick={handleConnect}
          >
            {connectionState === ConnectionState.Connected ? "Disconnect" : "Connect"}
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
    </div>
  );
};

export default InterviewPage;
