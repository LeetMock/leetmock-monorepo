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
import { Doc } from "@/convex/_generated/dataModel";
import { SessionMode, useSessionCreateModalState } from "@/hooks/use-session-create-modal";
import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_VOICES,
  InterviewStage,
  STAGE_NAME_MAPPING,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import React, { useCallback } from "react";
import { useMediaQuery } from "usehooks-ts";
import { QuestionCard } from "./question-card";

const INTERVIEW_DURATIONS = [15, 30, 45, 60, 75, 90];

const REQUIRED_STAGES = [InterviewStage.Intro, InterviewStage.Coding];

const SESSION_MODE_NAME_MAPPING = {
  [SessionMode.Practice]: "Practice Mode",
  [SessionMode.Strict]: "Strict Mode",
};

const MODEL_NAMES = ["gpt-4o", "claude-3.5-sonnet", "deepseek-v3"];

interface CodeInterviewConfigProps {
  selectedQuestion?: Doc<"questions">;
}

export const CodeInterviewConfig: React.FC<CodeInterviewConfigProps> = ({ selectedQuestion }) => {
  const { sessionConfig, setSessionConfig } = useSessionCreateModalState();
  const { interviewFlow, language, voice, interviewTime, modelName, mode } = sessionConfig;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const toggleStage = useCallback(
    (stage: InterviewStage) => {
      if (REQUIRED_STAGES.includes(stage)) return;
      const newInterviewFlow = { ...interviewFlow, [stage]: !interviewFlow[stage] };
      setSessionConfig({ interviewFlow: newInterviewFlow });
    },
    [interviewFlow, setSessionConfig]
  );

  return (
    <ScrollArea className={cn("w-full overflow-y-auto space-y-6 px-0.5", isDesktop && "flex-1")}>
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Interview Flow</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(interviewFlow).map(([stage, isSelected]) => (
            <Badge
              key={stage}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "text-sm py-1 px-3 transition-all",
                REQUIRED_STAGES.includes(stage as InterviewStage)
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:bg-blue-100 hover:text-blue-800"
              )}
              onClick={() => toggleStage(stage as InterviewStage)}
            >
              {STAGE_NAME_MAPPING[stage]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Selected Question</h3>
        {selectedQuestion && (
          <QuestionCard
            _id={selectedQuestion._id}
            title={selectedQuestion.title}
            difficulty={selectedQuestion.difficulty}
            category={selectedQuestion.category}
            onQuestionSelected={() => {}}
            isSelected={false}
            className="hover:scale-100"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label
            htmlFor="programming-language"
            className="text-sm font-semibold text-muted-foreground"
          >
            Programming Language
          </Label>
          <Select value={language} onValueChange={(language) => setSessionConfig({ language })}>
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
          <Label htmlFor="ai-voice" className="text-sm font-semibold text-muted-foreground">
            AI Interviewer Voice
          </Label>
          <Select value={voice} onValueChange={(voice) => setSessionConfig({ voice })}>
            <SelectTrigger id="ai-voice" className="w-full">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_VOICES.map(({ id, name, provider }) => (
                <SelectItem key={id} value={id}>
                  <span className="flex items-center gap-2">
                    {name}
                    <span className="text-xs text-muted-foreground">({provider})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label htmlFor="interview-time" className="text-sm font-semibold text-muted-foreground">
            Interview Duration (minutes)
          </Label>
          <Select
            value={interviewTime.toString()}
            onValueChange={(value) => setSessionConfig({ interviewTime: Number(value) })}
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

        <div className="space-y-4">
          <Label htmlFor="model-name" className="text-sm font-semibold text-muted-foreground">
            Model Name
          </Label>
          <Select
            value={modelName}
            onValueChange={(value) => setSessionConfig({ modelName: value })}
          >
            <SelectTrigger id="model-name" className="w-full max-w-xs">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_NAMES.map((modelName) => (
                <SelectItem key={modelName} value={modelName}>
                  {modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Interview Mode</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {Object.entries(SESSION_MODE_NAME_MAPPING).map(([modeOption, name]) => (
              <div className="flex items-center space-x-2" key={modeOption}>
                <Checkbox
                  id={modeOption}
                  checked={mode === modeOption}
                  onCheckedChange={() => setSessionConfig({ mode: modeOption as SessionMode })}
                  className="h-5 w-5"
                />
                <label htmlFor={modeOption} className="text-sm">
                  {name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
