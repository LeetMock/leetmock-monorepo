import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/hooks/use-editor-store";
import { Testcase } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PlusCircle, Save, X } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface TestcaseEditorProps {
  testcases: Testcase[];
  activeTab: string;
  connectionState: string;
  onTestcasesChange: (testcases: Testcase[]) => void;
  onActiveTabChange: (tab: string) => void;
  onSaveTestcases: () => void;
}

const getInputKeys = (testcases: Testcase[]): string[] => {
  if (!testcases || testcases.length === 0) return [];
  return Object.keys(testcases[0].input);
};

export const TestcaseEditor: React.FC<TestcaseEditorProps> = ({
  testcases,
  activeTab,
  connectionState,
  onTestcasesChange,
  onActiveTabChange,
  onSaveTestcases,
}) => {
  const { setHasTestcaseChanges, hasTestcaseChanges } = useEditorStore();
  const inputKeys = getInputKeys(testcases);
  const isConnected = connectionState === "connected";

  const handleTestcaseChange = (
    index: number,
    key: string,
    value: any,
    isExpectedOutput: boolean = false
  ) => {
    if (!isConnected) {
      toast.error("You are not connected to the interview room.");
      return;
    }

    const updatedTestcases = testcases.map((testcase, i) =>
      i === index
        ? {
            ...testcase,
            input: isExpectedOutput
              ? testcase.input
              : { ...testcase.input, [key]: tryParseValue(value) },
            expectedOutput: isExpectedOutput ? tryParseValue(value) : testcase.expectedOutput,
          }
        : testcase
    );
    setHasTestcaseChanges(true);
    onTestcasesChange(updatedTestcases);
  };

  const tryParseValue = (value: string): any => {
    if (value.trim() === "") {
      return "";
    }

    try {
      if (value.startsWith("[") && value.endsWith("]")) {
        return JSON.parse(value);
      }
      if (!isNaN(Number(value))) {
        return Number(value);
      }
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const addTestcase = () => {
    if (!isConnected) {
      toast.error("You are not connected to the interview room.");
      return;
    }

    if (testcases.length >= 5) {
      toast.warning("You can create a maximum of 5 testcases.");
      return;
    }
    const newTestcase: Testcase = {
      input: inputKeys.reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
      expectedOutput: "",
    };
    const updatedTestcases = [...testcases, newTestcase];
    setHasTestcaseChanges(true);
    onTestcasesChange(updatedTestcases);
    onActiveTabChange((testcases.length + 1).toString());
  };

  const deleteTestcase = (indexToDelete: number) => {
    if (!isConnected) {
      toast.error("You are not connected to the interview room.");
      return;
    }

    const updatedTestcases = testcases.filter((_, index) => index !== indexToDelete);
    setHasTestcaseChanges(true);
    onTestcasesChange(updatedTestcases);
    onActiveTabChange("1");
  };

  return (
    <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
      <TabsList className="bg-background/95 p-1 flex items-center justify-between">
        <div className="flex items-center flex-1 space-x-2">
          {testcases.map((_, index) => (
            <div key={index + 1} className="relative group">
              <TabsTrigger
                value={(index + 1).toString()}
                className="px-3 py-1.5 text-sm font-medium"
                disabled={!isConnected}
              >
                Case {index + 1}
              </TabsTrigger>
              {testcases.length > 1 && isConnected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTestcase(index);
                  }}
                  className="absolute -top-2 -right-2 p-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={!isConnected}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={addTestcase}
            className="ml-2 p-1.5"
            disabled={!isConnected || testcases.length >= 5}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        {hasTestcaseChanges && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSaveTestcases();
            }}
            className={cn(
              "ml-2 transition-all duration-200 ease-in-out",
              "bg-blue-500/10 hover:bg-blue-500/20",
              "text-blue-500 hover:text-blue-600",
              "border-blue-500/20 hover:border-blue-500/30"
            )}
            disabled={!isConnected}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </Button>
        )}
      </TabsList>
      {testcases.map((testcase, index) => (
        <TabsContent key={index} value={(index + 1).toString()} className="mt-3 mx-1 space-y-4">
          {inputKeys.map((key) => (
            <div key={key}>
              <label htmlFor={`${key}-${index}`} className="block text-sm font-medium mb-1">
                {key} =
              </label>
              <Input
                id={`${key}-${index}`}
                value={
                  Array.isArray(testcase.input[key])
                    ? JSON.stringify(testcase.input[key])
                    : String(testcase.input[key] ?? "")
                }
                onChange={(e) => handleTestcaseChange(index, key, e.target.value)}
                className="bg-secondary/50"
                disabled={!isConnected}
              />
            </div>
          ))}

          <div>
            <label htmlFor={`expected-output-${index}`} className="block text-sm font-medium mb-1">
              Expected Output =
            </label>
            <Input
              id={`expected-output-${index}`}
              value={
                testcase.expectedOutput !== undefined
                  ? Array.isArray(testcase.expectedOutput)
                    ? JSON.stringify(testcase.expectedOutput)
                    : String(testcase.expectedOutput)
                  : ""
              }
              onChange={(e) => handleTestcaseChange(index, "", e.target.value, true)}
              className="bg-secondary/50"
              disabled={!isConnected}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};
