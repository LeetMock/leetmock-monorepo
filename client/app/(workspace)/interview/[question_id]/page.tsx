"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import "react-resizable/css/styles.css";
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
import { useInterview } from "@/hooks/useInterview";
import { LANGUAGES } from "@/lib/constants";
import { useTheme } from "next-themes";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useToast } from "@/components/ui/use-toast";
import { QuestionHolder } from "@/components/questions/QuestionHolder";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { InterviewToolbar } from "../_components/InterviewToolbar";
import { Track } from "livekit-client";
import { useTracks, LiveKitRoom } from "@livekit/components-react";
import { StartAudio } from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";

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

  const params = useParams();
  const questionId = parseInt(params.question_id as string, 10);

  const { accessToken, serverUrl, shouldConnect, connect } = useConnection();

  // const trackRefs = useTracks([Track.Source.Microphone]);
  // const tokyoCamTrackRef = trackRefs.find((trackRef) => trackRef.participant.name === "tokyo");

  // console.log(trackRefs);
  // console.log(tokyoCamTrackRef);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const question = useQuery(api.questions.getByQuestionId, { question_id: questionId });
  const { toast } = useToast();

  // Check if the conversion was successful
  if (isNaN(questionId)) {
    console.error("Invalid question_id:", params.question_id);
    // Handle the error appropriately, e.g., show an error message or redirect
    return <div>Invalid question ID</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full">
      <InterviewToolbar />
      <div className="w-full h-full flex justify-center items-center">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel className="min-w-[20rem]">
            <div className="w-full h-full overflow-auto">
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
                <Select>
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
                  language="python"
                  theme={theme === "dark" ? "customDarkTheme" : "vs-light"}
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
        <div className="w-[28rem] border-l h-full p-2">
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              connect();
            }}
          >
            Connect
          </Button>
          <LiveKitRoom serverUrl={serverUrl} token={accessToken} connect={shouldConnect}>
            <StartAudio label="Click to allow audio playback" />
            {/* Your components go here. */}
          </LiveKitRoom>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
