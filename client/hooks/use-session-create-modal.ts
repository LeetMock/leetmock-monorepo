import { Id } from "@/convex/_generated/dataModel";
import {
  AVAILABLE_LANGUAGES,
  AVAILABLE_VOICES,
  InterviewFlow,
  InterviewStage,
} from "@/lib/constants";
import { allDefined, isDefined } from "@/lib/utils";
import { useMemo } from "react";
import { create } from "zustand";

export enum SessionType {
  Coding = "coding",
  SystemDesign = "system_design",
  Behavioral = "behavioral",
}

export enum SessionMode {
  Practice = "practice",
  Strict = "strict",
}

export interface SessionConfigState {
  type?: SessionType;
  questionId?: Id<"questions">;
  interviewFlow: InterviewFlow;
  language: string;
  voice: string;
  interviewTime: number;
  mode: SessionMode;
  modelName: string;
}

interface SessionCreateModalState {
  sessionConfig: SessionConfigState;
  setSessionConfig: (params: Partial<SessionConfigState>) => void;
  reset: () => void;
}

const INITIAL_SESSION_CONFIG: SessionConfigState = {
  language: AVAILABLE_LANGUAGES[0],
  voice: AVAILABLE_VOICES[0].id,
  interviewTime: 30,
  mode: SessionMode.Practice,
  modelName: "gpt-4o",
  interviewFlow: {
    [InterviewStage.Intro]: true,
    [InterviewStage.Background]: false,
    [InterviewStage.Coding]: true,
    [InterviewStage.Evaluation]: false,
  },
};

export const useSessionCreateModalState = create<SessionCreateModalState>((set, get) => ({
  sessionConfig: INITIAL_SESSION_CONFIG,
  setSessionConfig: (params: Partial<SessionConfigState>) =>
    set({ sessionConfig: { ...get().sessionConfig, ...params } }),
  reset: () => set({ sessionConfig: INITIAL_SESSION_CONFIG }),
}));

export const useSessionCreateModal = () => {
  const { sessionConfig, setSessionConfig, reset } = useSessionCreateModalState();
  const { type, questionId } = sessionConfig;

  const hasSetInterviewType = useMemo(() => isDefined(type), [type]);
  const hasSetProblem = useMemo(() => {
    if (!hasSetInterviewType) return false;

    if (type === SessionType.Coding) {
      return isDefined(questionId);
    }

    return false;
  }, [questionId, hasSetInterviewType, type]);

  const hasConfiguredSession = useMemo(() => {
    if (!hasSetProblem) return false;

    if (type === SessionType.Coding) {
      return allDefined(sessionConfig);
    }

    return false;
  }, [sessionConfig, type, hasSetProblem]);

  return {
    sessionConfig,
    hasConfiguredSession,
    hasSetInterviewType,
    hasSetProblem,
    setSessionConfig,
    reset,
  };
};
