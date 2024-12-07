import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CodeInterviewConfigState } from "@/hooks/use-session-create-modal";
import { AVAILABLE_LANGUAGES, AVAILABLE_VOICES, InterviewStage } from "@/lib/constants";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { QuestionCard } from "./question-card";

const stageNameMapping: Record<InterviewStage, string> = {
  [InterviewStage.Background]: "Background Discussion",
  [InterviewStage.Coding]: "Coding",
  [InterviewStage.Evaluation]: "Evaluation",
};

const INTERVIEW_DURATIONS = [15, 30, 45, 60, 75, 90];

interface CodeInterviewConfigProps {
  onConfigUpdate: (params: CodeInterviewConfigState) => void;
  selectedQuestion: any; // Replace 'any' with the actual type of selectedQuestion
}

export const CodeInterviewConfig: React.FC<CodeInterviewConfigProps> = ({
  onConfigUpdate,
  selectedQuestion,
}) => {
  const [config, setConfig] = useState<CodeInterviewConfigState>({
    interviewFlow: [InterviewStage.Coding],
    language: AVAILABLE_LANGUAGES[0],
    voice: AVAILABLE_VOICES[0],
    interviewTime: 30,
    mode: "practice",
  });

  const [stages, setStages] = useState<Record<InterviewStage, boolean>>({
    [InterviewStage.Background]: true,
    [InterviewStage.Coding]: true,
    [InterviewStage.Evaluation]: true,
  });

  const [language, setLanguage] = useState(AVAILABLE_LANGUAGES[0]);
  const [voice, setVoice] = useState(AVAILABLE_VOICES[0]);
  const [interviewTime, setInterviewTime] = useState(30);
  const [mode, setMode] = useState<"practice" | "strict">("practice");

  const updateConfig = useCallback(
    (updates: Partial<CodeInterviewConfigState>) => {
      setConfig((prevConfig) => ({ ...prevConfig, ...updates }));
    },
    [setConfig]
  );

  useEffect(() => {
    onConfigUpdate(config);
  }, [config, onConfigUpdate]);

  useEffect(() => {
    const interviewFlow = Object.entries(stages)
      .filter(([_, isSelected]) => isSelected)
      .map(([stage]) => stage as InterviewStage);

    updateConfig({
      interviewFlow,
      language,
      voice,
      interviewTime,
      mode,
    });
  }, [stages, language, voice, interviewTime, mode]);

  const toggleStage = (stage: InterviewStage) => {
    if (stage !== InterviewStage.Coding) {
      setStages((prev) => ({ ...prev, [stage]: !prev[stage] }));
    }
  };

  return (
    <div className="w-full max-w-[95%] mx-auto overflow-y-auto max-h-[calc(100vh-100px)] scrollbar-hide">
      <div className="space-y-8 p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interview Flow</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stages).map(([stage, isSelected]) => (
              <Badge
                key={stage}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-sm py-1 px-3 transition-all",
                  stage === "coding" ? "opacity-50" : "hover:bg-blue-100 hover:text-blue-800"
                )}
                onClick={() => toggleStage(stage as InterviewStage)}
              >
                {stageNameMapping[stage]}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Selected Question</h3>
          <QuestionCard
            _id={selectedQuestion._id}
            title={selectedQuestion.title}
            difficulty={selectedQuestion.difficulty}
            category={selectedQuestion.category}
            onQuestionSelected={() => {}}
            isSelected={false}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="programming-language" className="text-sm font-medium">
              Programming Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="programming-language" className="w-full">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-voice" className="text-sm font-medium">
              AI Interviewer Voice
            </Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger id="ai-voice" className="w-full">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VOICES.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <Label htmlFor="interview-time" className="text-sm font-medium">
            Interview Duration (minutes)
          </Label>
          <Select
            value={interviewTime.toString()}
            onValueChange={(value) => setInterviewTime(Number(value))}
          >
            <SelectTrigger id="interview-time" className="w-full max-w-xs">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {INTERVIEW_DURATIONS.map((duration) => (
                <SelectItem key={duration} value={duration.toString()}>
                  {duration} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interview Mode</h3>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="practice-mode"
                checked={mode === "practice"}
                onCheckedChange={() => setMode("practice")}
                className="h-5 w-5"
              />
              <label htmlFor="practice-mode" className="text-sm">
                Practice Mode
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="strict-mode"
                checked={mode === "strict"}
                onCheckedChange={() => setMode("strict")}
                className="h-5 w-5"
              />
              <label htmlFor="strict-mode" className="text-sm">
                Strict Mode
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
