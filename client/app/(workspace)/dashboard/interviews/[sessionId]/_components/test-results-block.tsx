import { Button } from "@/components/ui/button";
import { TestCase, TestResultsProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Fragment, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export const TestResultsBlock: React.FC<TestResultsProps> = ({ results }) => {
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(null);

  if (!results || results.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Please run tests first to get results
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === results.length;

  return (
    <div className="text-sm h-full overflow-auto p-2">
      <div className="flex justify-between items-center mb-4 bg-secondary rounded-lg p-1">
        <div className="flex items-center">
          {allPassed ? (
            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-red-500 mr-2" />
          )}
          <h2 className={cn("font-bold text-lg", allPassed ? "text-green-500" : "text-red-500")}>
            {allPassed ? "All Test Cases Passed" : "Some Test Cases Failed"}
          </h2>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground mr-2">Passed:</span>
          <span className="font-semibold">{passedCount} / {results.length}</span>
        </div>
      </div>
      {!allPassed && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {results.map((result) => (
              <Button
                key={result.caseNumber}
                onClick={() => setSelectedCase(result)}
                variant="outline"
                className={cn(
                  "text-xs py-1 px-3 h-8 rounded-full",
                  result.passed
                    ? "border-green-500 text-green-500 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-600"
                    : "border-red-500 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600",
                  selectedCase?.caseNumber === result.caseNumber &&
                  "border-2 font-semibold"
                )}
              >
                Case {result.caseNumber}
              </Button>
            ))}
          </div>
          {selectedCase && (
            <div className="space-y-4">
              <TestCaseDetail title="Input" data={selectedCase.input} />
              <TestCaseDetail title="Your Output" data={selectedCase.actual} />
              <TestCaseDetail title="Expected Output" data={selectedCase.expected} />
              {selectedCase.error && <TestCaseDetail title="Error" data={selectedCase.error} />}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const TestCaseDetail: React.FC<{ title: string; data: any }> = ({ title, data }) => {
  const formatData = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(
        value,
        (key, val) => {
          if (Array.isArray(val)) {
            return JSON.stringify(val);
          }
          return val;
        },
        2
      ).replace(/"(\[.*?\])"/g, (match, p1) => p1.replace(/\\"/g, '"'));
    }
    return JSON.stringify(value, null, 2);
  };

  const renderErrorMessage = (error: string) => {
    return error.split("\n").map((line, index) => (
      <Fragment key={index}>
        {line}
        <br />
      </Fragment>
    ));
  };

  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">{title}:</h3>
      {title === "Input" ? (
        <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs overflow-x-auto p-3 rounded">
          {Object.entries(data).map(([key, value], index) => (
            <div key={index} className="mb-1 font-mono">
              <span className="text-blue-600 dark:text-blue-400">{key}</span>
              <span className="text-gray-600 dark:text-gray-400"> = </span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatData(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <pre
          className={cn(
            "text-xs overflow-x-auto p-3 rounded",
            title === "Error"
              ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
              : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
          )}
        >
          {title === "Error" ? renderErrorMessage(data) : formatData(data)}
        </pre>
      )}
    </div>
  );
};
