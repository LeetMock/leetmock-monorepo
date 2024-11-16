import { Id } from "@/convex/_generated/dataModel";
import { CodeSessionEvent } from "@/convex/types";
import { RunTestResult, Testcase } from "@/lib/types";
import { toast } from "sonner";
import { create } from "zustand";

interface EditorStore {
  //a list of state variables
  testResults: RunTestResult | null;
  outputView: "Testcase" | "testResults";
  testRunCounter: number;
  isRunning: boolean;
  savedTestcases: Testcase[];
  draftTestcases: Testcase[];
  activeTestcaseTab: string;
  hasTestcaseChanges: boolean;

  //actions
  setTestResults: (results: RunTestResult | null) => void;
  setOutputView: (view: "Testcase" | "testResults") => void;
  incrementTestCounter: () => void;
  setIsRunning: (isRunning: boolean) => void;
  setTestcases: (testcases: Testcase[]) => void;
  updateDraft: (testcases: Testcase[]) => void;
  saveDraft: () => void;
  discardDraft: () => void;
  setActiveTestcaseTab: (tab: string) => void;
  handleRunTests: (params: {
    sessionId: Id<"sessions">;
    questionId: Id<"questions">;
    language: string;
    editorState: any;
    runTests: any;
    onCommitEvent: (event: CodeSessionEvent) => void;
  }) => Promise<void>;
  reset: () => void;
  setHasTestcaseChanges: (value: boolean) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  testResults: null,
  outputView: "Testcase",
  testRunCounter: 0,
  isRunning: false,
  savedTestcases: [],
  draftTestcases: [],
  activeTestcaseTab: "1",
  hasTestcaseChanges: false,

  setTestResults: (results) => set({ testResults: results }),
  setOutputView: (view) => set({ outputView: view }),
  incrementTestCounter: () => set((state) => ({ testRunCounter: state.testRunCounter + 1 })),
  setIsRunning: (isRunning) => set({ isRunning }),
  setTestcases: (testcases) =>
    set({
      savedTestcases: testcases,
      draftTestcases: testcases,
    }),
  updateDraft: (testcases) =>
    set({
      draftTestcases: testcases,
      hasTestcaseChanges: true,
    }),
  saveDraft: () =>
    set((state) => ({
      savedTestcases: state.draftTestcases,
      hasTestcaseChanges: false,
    })),
  discardDraft: () =>
    set((state) => ({
      draftTestcases: state.savedTestcases,
      hasTestcaseChanges: false,
    })),
  setActiveTestcaseTab: (tab) => set({ activeTestcaseTab: tab }),

  handleRunTests: async ({
    sessionId,
    questionId,
    language,
    editorState,
    runTests,
    onCommitEvent,
  }) => {
    const store = get();
    if (!editorState) return;

    store.setIsRunning(true);
    store.setTestResults(null);
    store.setOutputView("testResults");
    store.incrementTestCounter();

    try {
      const result = await runTests({ language, sessionId, questionId });
      if (result.status === "success" && result.testResults) {
        store.setTestResults(result.testResults);
        onCommitEvent({
          type: "user_testcase_executed",
          data: { testResults: result.testResults },
        });
      } else {
        const errorMessage =
          result.stderr || result.exception || "Error running tests. Please try again.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error running tests:", error);
      toast.error("Error running tests. Please try again.");
    }
    store.setIsRunning(false);
  },

  reset: () =>
    set({
      testResults: null,
      outputView: "Testcase",
      testRunCounter: 0,
      hasTestcaseChanges: false,
      isRunning: false,
      savedTestcases: [],
      draftTestcases: [],
      activeTestcaseTab: "1",
    }),

  setHasTestcaseChanges: (value) => set({ hasTestcaseChanges: value }),
}));
