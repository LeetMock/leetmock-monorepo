"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { editor as monacoEditor } from "monaco-editor";
import { IoLogoPython } from "react-icons/io5";
import { PiFileCppFill } from "react-icons/pi";
import { FaJava } from "react-icons/fa6";
import { IoLogoJavascript } from "react-icons/io5";
import { SiTypescript } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import { useTheme } from "next-themes";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TestResultsBlock } from "./test-results-block";
import { TestTube2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { EditorState, useEditorState } from "@/hooks/useEditorState";
import { toast } from "sonner";
import { RunTestResult } from "@/lib/types";
import { useResizePanel } from "@/hooks/use-resize-panel";

const darkEditorTheme: monacoEditor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#181a1f",
  },
};

export const languageIcons = {
  python: <IoLogoPython className="w-3.5 h-3.5" />,
  cpp: <PiFileCppFill className="w-[0.85rem] h-[0.85rem]" />,
  java: <FaJava className="w-3.5 h-3.5" />,
  javascript: <IoLogoJavascript className="w-3.5 h-3.5" />,
  typescript: <SiTypescript className="w-[0.8rem] h-[0.8rem]" />,
  golang: <FaGolang className="w-5 h-5" />,
};

export interface CodeEditorPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId: Id<"sessions">;
  questionId: Id<"questions">;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  className,
  sessionId,
  questionId,
  ...props
}) => {
  const { theme } = useTheme();
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Convex
  const createSnapshot = useMutation(api.editorSnapshots.create);
  const runTests = useAction(api.actions.runTests);
  const runCode = useAction(api.actions.runCode);

  const [testResults, setTestResults] = useState<RunTestResult | null>(null);
  const [outputView, setOutputView] = useState<"output" | "testResults">("output");
  const [testRunCounter, setTestRunCounter] = useState(0);

  const { size, isResizing, resizeHandleProps } = useResizePanel({
    defaultSize: 400,
    minSize: 200,
    maxSize: 800,
    direction: "vertical",
    storageId: "leetmock.workspace.code-editor",
  });

  const handleSnapshotChange = useCallback(
    (snapshot: EditorState) => {
      const promise = createSnapshot({ sessionId, ...snapshot });
      toast.promise(promise, {
        success: "Snapshot saved",
        error: "Error saving snapshot",
      });
    },
    [sessionId, createSnapshot]
  );

  const {
    editorState,
    isRunning,
    setIsRunning,
    onLanguageChange,
    onContentChange,
    onTerminalChange,
  } = useEditorState(sessionId, handleSnapshotChange);

  const language = "python";
  const icon = useMemo(() => {
    return languageIcons[language as keyof typeof languageIcons];
  }, [language]);

  const handleRunCode = async () => {
    const { language, content } = editorState!.editor;
    setIsRunning(true);
    try {
      const result = await runCode({ language, code: content });

      if (result && result.status) {
        const { executionTime, isError, output } = result;
        onTerminalChange({ output, isError, executionTime });
      } else {
        toast.error("Error running code. Please try again.");
      }
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Error running code. Please try again.");
    }

    setIsRunning(false);
  };

  const handleRunTests = async () => {
    const { language, content } = editorState!.editor;
    setIsRunning(true);
    setTestResults(null);
    setOutputView("testResults");
    setTestRunCounter((prev) => prev + 1);

    try {
      const result = await runTests({ language, code: content, questionId: questionId });

      if (result.status === "success" && result.testResults) {
        const executionTime = result.executionTime;
        setTestResults(result.testResults);
        const allPassed = result.testResults.every((testCase) => testCase.passed);

        onTerminalChange({
          output: allPassed
            ? "All test cases passed!"
            : "Some test cases failed. See details above.",
          isError: !allPassed,
          executionTime,
        });
      } else {
        const errorMessage =
          result.stderr || result.exception || "Error running tests. Please try again.";
        onTerminalChange({
          output: errorMessage,
          isError: true,
          executionTime: result.executionTime,
        });
      }
    } catch (error) {
      console.error("Error running tests:", error);
      onTerminalChange({
        output: "Error running tests. Please try again.",
        isError: true,
        executionTime: 0,
      });
    }

    setIsRunning(false);
  };

  if (!editorState) {
    return <div>Loading...</div>;
  }

  return (
    <div className={cn("h-full w-full flex flex-col", className)} {...props}>
      <div
        className={cn(
          "flex flex-col justify-start w-full border shrink-0",
          "bg-background rounded-md shadow-md"
        )}
        style={{ height: size }}
      >
        <div className="flex justify-between items-center px-3 py-2 border-b">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="text-sm font-semibold mb-px">
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="w-28 h-7 relative"
              onClick={handleRunTests}
              disabled={isRunning}
            >
              {isRunning ? (
                <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin" />
              ) : (
                <>
                  <TestTube2 className="w-4 h-4 mr-1" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="h-full relative rounded-md pb-2" ref={editorContainerRef}>
          <Editor
            className="absolute inset-0"
            language={language}
            theme={theme === "dark" ? "customDarkTheme" : "vs-light"}
            value={editorState.editor.content}
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
            onChange={(value) => onContentChange(value || "")}
            beforeMount={(monaco) => {
              monaco.editor.defineTheme("customDarkTheme", darkEditorTheme);
              monaco.editor.setTheme("customDarkTheme");
            }}
          />
        </div>
      </div>
      <div
        className={cn(
          "h-px w-full cursor-ns-resize py-1 transition-all",
          isResizing ? "bg-muted-foreground/10" : "bg-transparent"
        )}
        {...resizeHandleProps}
      />
      <div
        className={cn(
          "flex p-3 flex-col space-y-2 h-full w-full border",
          "bg-background rounded-md shadow-md"
        )}
      >
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOutputView("output")}
              className={cn(
                "text-sm font-medium",
                outputView === "output" ? "bg-secondary" : "hover:bg-secondary/50"
              )}
            >
              Output
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOutputView("testResults")}
              className={cn(
                "text-sm font-medium",
                outputView === "testResults" ? "bg-secondary" : "hover:bg-secondary/50"
              )}
            >
              Test Results
            </Button>
          </div>
          {!isRunning && outputView === "output" && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{editorState.terminal.executionTime} ms</span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-md bg-secondary h-full overflow-auto">
          {outputView === "testResults" && testResults ? (
            <TestResultsBlock key={testRunCounter} results={testResults} />
          ) : (
            <pre
              className={cn(
                "text-sm p-1 rounded-md",
                editorState.terminal.isError ? "text-red-500" : "text-gray-800 dark:text-gray-200"
              )}
            >
              <code>{editorState.terminal.output}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
