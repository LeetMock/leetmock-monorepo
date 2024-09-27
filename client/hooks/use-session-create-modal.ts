import { Id } from "@/convex/_generated/dataModel";
import { allDefined, isDefined } from "@/lib/utils";
import { useMemo } from "react";
import { create } from "zustand";

export enum SessionType {
  CodeInterview = 0,
  SystemDesign = 1,
  Behavioral = 2,
}

export interface CodeInterviewState {
  questionId: Id<"questions">;
}

interface SessionCreateModalState {
  type?: SessionType;
  codeInterview: Partial<CodeInterviewState>;
  setType: (type: SessionType | undefined) => void;
  updateCodeInterview: (params: Partial<CodeInterviewState>) => void;
  reset: () => void;
}

export const useSessionCreateModalState = create<SessionCreateModalState>((set, get) => ({
  type: undefined,
  codeInterview: {},
  setType: (type) => set({ type }),
  updateCodeInterview: (params: Partial<CodeInterviewState>) =>
    set({ codeInterview: { ...get().codeInterview, ...params } }),
  reset: () => set({ type: undefined, codeInterview: {} }),
}));

export const useSessionCreateModal = () => {
  const { type, setType, codeInterview, updateCodeInterview, reset } = useSessionCreateModalState();

  const hasSetInterviewType = useMemo(() => isDefined(type), [type]);

  const hasSetProblem = useMemo(() => {
    if (!hasSetInterviewType) return false;

    if (type === SessionType.CodeInterview) {
      return isDefined(codeInterview.questionId);
    }

    return false;
  }, [codeInterview, hasSetInterviewType, type]);

  const hasConfiguredSession = useMemo(() => {
    if (!hasSetProblem) return false;

    if (type === SessionType.CodeInterview) {
      return allDefined(codeInterview);
    }

    return true;
  }, [codeInterview, type, hasSetProblem]);

  const maxStep = useMemo(() => {
    if (!hasSetInterviewType) return 0;
    if (!hasSetProblem) return 1;
    if (!hasConfiguredSession) return 2;
    return 3;
  }, [hasSetInterviewType, hasSetProblem, hasConfiguredSession]);

  return {
    maxStep,
    type,
    codeInterview,
    hasConfiguredSession,
    hasSetInterviewType,
    hasSetProblem,
    setType,
    updateCodeInterview,
    reset,
  };
};
