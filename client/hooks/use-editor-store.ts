import { create } from "zustand";
import { RunTestResult, Testcase } from "@/lib/types";
import { Id } from "@/convex/_generated/dataModel";
import { CodeSessionEvent } from "@/convex/types";
import { toast } from "sonner";

interface EditorStore {
    //a list of state variables
    testResults: RunTestResult | null;
    outputView: "Testcase" | "testResults";
    testRunCounter: number;
    isRunning: boolean;
    localTestcases: Testcase[];
    activeTestcaseTab: string;
    hasTestcaseChanges: boolean;

    //actions
    setTestResults: (results: RunTestResult | null) => void;
    setOutputView: (view: "Testcase" | "testResults") => void;
    incrementTestCounter: () => void;
    setIsRunning: (isRunning: boolean) => void;
    setLocalTestcases: (testcases: Testcase[]) => void;
    setActiveTestcaseTab: (tab: string) => void;
    handleRunTests: (params: {
        sessionId: Id<"sessions">;
        questionId: Id<"questions">;
        language: string;
        editorState: any;
        runTests: any;
        onCommitEvent: (event: CodeSessionEvent) => void;
    }) => Promise<void>;
    setHasTestcaseChanges: (hasChanges: boolean) => void;
    reset: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
    testResults: null,
    outputView: "Testcase",
    testRunCounter: 0,
    isRunning: false,
    localTestcases: [],
    activeTestcaseTab: "1",
    hasTestcaseChanges: false,

    setTestResults: (results) => set({ testResults: results }),
    setOutputView: (view) => set({ outputView: view }),
    incrementTestCounter: () => set((state) => ({ testRunCounter: state.testRunCounter + 1 })),
    setIsRunning: (isRunning) => set({ isRunning }),
    setLocalTestcases: (testcases) => set({ localTestcases: testcases }),
    setActiveTestcaseTab: (tab) => set({ activeTestcaseTab: tab }),
    setHasTestcaseChanges: (hasChanges) => set({ hasTestcaseChanges: hasChanges }),

    handleRunTests: async ({ sessionId, questionId, language, editorState, runTests, onCommitEvent }) => {
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
            } else {
                const errorMessage = result.stderr || result.exception || "Error running tests. Please try again.";
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error("Error running tests:", error);
            toast.error("Error running tests. Please try again.");
        }
        store.setIsRunning(false);
    },

    reset: () => set({
        testResults: null,
        outputView: "Testcase",
        testRunCounter: 0,
        hasTestcaseChanges: false,
        isRunning: false,
        localTestcases: [],
        activeTestcaseTab: "1"
    }),
})); 