"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef } from "react";
import "react-resizable/css/styles.css";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { TwoSum } from "@/components/questions/TwoSum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInterview } from "@/hooks/useInterview";
import { LANGUAGES, VOICES } from "@/lib/constants";
import { useTheme } from "next-themes";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { LucideVolume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { QuestionHolder } from "@/components/questions/QuestionHolder";
import { NumIslands } from "@/components/questions/NumIslands";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const formatTimeV2 = (time: number): number[] => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return [Math.floor(minutes / 10), minutes % 10, Math.floor(seconds / 10), seconds % 10];
};

const InterviewPage: React.FC = () => {
  const { theme } = useTheme();

  const params = useParams();
  const questionId = parseInt(params.question_id as string, 10);

  const {
    code,
    language,
    voice,
    timeLeft,
    isInterviewActive,
    isAgentTalking,
    transcript,
    editorRef,
    setQuestionId,
    handleEditorChange,
    toggleInterview,
    handleLanguageChange,
    handleVoiceChange,
    handleResize,
  } = useInterview(questionId);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const question = useQuery(api.questions.getByQuestionId, { question_id: questionId });
  const { toast } = useToast();

  // Update questionId in the hook if it changes in the URL
  useEffect(() => {
    setQuestionId(questionId);
  }, [questionId, setQuestionId]);

  // Check if the conversion was successful
  if (isNaN(questionId)) {
    console.error("Invalid question_id:", params.question_id);
    // Handle the error appropriately, e.g., show an error message or redirect
    return <div>Invalid question ID</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen w-full">
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
            <div className="flex justify-between items-center p-3 border-b">
              <Select onValueChange={handleLanguageChange} value={language}>
                <SelectTrigger className="w-[150px]">
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
              <div className="flex items-center justify-center space-x-3">
                <div>
                  <LucideVolume2
                    className={cn(
                      "w-[1.2rem] h-[1.2rem] opacity-0 text-blue-500",
                      isAgentTalking ? "animate-pulse opacity-100" : ""
                    )}
                  />
                </div>
                <div className="bg-secondary font-semibold py-0.5 px-1 rounded-md flex space-x-0.5 hover:bg-gray-200 transition-all select-none cursor-pointer dark:hover:bg-gray-700">
                  <div className="px-1 py-0.5 rounded-sm text-sm">
                    {formatTimeV2(timeLeft).slice(0, 2)}
                  </div>
                  <div className="py-0.5 rounded-sm text-sm">:</div>
                  <div className="px-1 py-0.5 rounded-sm text-sm">
                    {formatTimeV2(timeLeft).slice(2, 4)}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 h-full relative" ref={editorContainerRef}>
              <Editor
                className="absolute inset-0"
                language={language}
                value={code}
                onChange={handleEditorChange}
                theme={theme === "dark" ? "vs-dark" : "vs-light"}
                options={{
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </div>
            <div className="flex justify-end p-3 border-t">
              {/* <Label>
                  {vad.userSpeaking
                    ? "🔴 User Speaking"
                    : "⚪ User Not Speaking"}
                </Label> */}

              <Button
                onClick={toggleInterview}
                className={cn(
                  "transition-colors duration-200",
                  isInterviewActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300"
                )}
              >
                {isInterviewActive ? "End Interview" : "Start Interview"}
              </Button>
            </div>
            {/* {isInterviewActive && (
                <div
                  className="bg-gray-700 text-white p-2 overflow-y-auto"
                  style={{ maxHeight: "100px" }}
                >
                  <strong>Transcript:</strong> {transcript}
                </div>
              )} */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default InterviewPage;
