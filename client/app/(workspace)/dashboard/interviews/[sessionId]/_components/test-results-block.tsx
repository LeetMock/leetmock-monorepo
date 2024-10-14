import { Button } from "@/components/ui/button";
import { TestCase, TestResultsProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export const TestResultsBlock: React.FC<TestResultsProps> = ({ results }) => {
  const [selectedCase, setSelectedCase] = React.useState<TestCase | null>(null);
  const passedCount = results.filter((r) => r.passed).length;
  const allPassed = passedCount === results.length;

  return (
    <div className="text-sm h-full overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h2 className={cn("font-bold", allPassed ? "text-green-500" : "text-red-500")}>
          {allPassed ? "All Passed" : "Some Failed"}
        </h2>
        <p>
          Passed: {passedCount} / {results.length}
        </p>
      </div>
      {!allPassed && (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {results.map((result) => (
              <Button
                key={result.caseNumber}
                onClick={() => setSelectedCase(result)}
                variant="outline"
                className={cn(
                  "text-xs py-0.5 px-1.5 h-7",
                  result.passed
                    ? "border-green-500 text-green-500 hover:bg-green-100 hover:text-green-600"
                    : "border-red-500 text-red-500 hover:bg-red-100 hover:text-red-600",
                  selectedCase?.caseNumber === result.caseNumber && "bg-secondary"
                )}
              >
                Case {result.caseNumber}
              </Button>
            ))}
          </div>
          {selectedCase && (
            <div className="space-y-2">
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
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div>
      <h3 className="font-bold text-xs">{title}:</h3>
      <pre
        className={cn(
          "text-xs overflow-x-auto bg-background p-1 rounded",
          title === "Error" ? "text-red-500" : ""
        )}
      >
        {title === "Error" ? renderErrorMessage(data) : formatData(data)}
      </pre>
    </div>
  );
};
