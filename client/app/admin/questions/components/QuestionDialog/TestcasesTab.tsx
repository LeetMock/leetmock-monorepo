"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Parameter, Testcase } from "../../utils/types";

interface TestcasesTabProps {
    testcases: Testcase[];
    setTestcases: React.Dispatch<React.SetStateAction<Testcase[]>>;
    parameters: string[];
    parameterTypes: {
        cpp: Record<string, string>;
        java: Record<string, string>;
        javascript: Record<string, string>;
        python: Record<string, string>;
    };
    selectedOutputType: string;
    handleTestcaseChange: (index: number, paramName: string, value: string) => void;
    handleAddTestcase: () => void;
}

export default function TestcasesTab({
    testcases,
    setTestcases,
    parameters,
    parameterTypes,
    selectedOutputType,
    handleTestcaseChange,
    handleAddTestcase
}: TestcasesTabProps) {
    // Get all unique parameter names across all languages
    const allParameterNames = Object.values(parameterTypes).flatMap(params => Object.keys(params));
    const uniqueParameterNames = Array.from(new Set(allParameterNames));

    // Helper function to check if a parameter is an array type
    const isArrayType = (paramName: string) => {
        return parameterTypes.javascript[paramName]?.includes('[]') ||
            parameterTypes.python[paramName]?.includes('List') ||
            parameterTypes.cpp[paramName]?.includes('vector');
    };

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            {testcases.map((testcase, index) => (
                <Card key={index} className="p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-medium">Test Case {index + 1}</h3>
                        {index > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    const newTestcases = testcases.filter((_, i) => i !== index);
                                    setTestcases(newTestcases);
                                }}
                            >
                                Remove
                            </Button>
                        )}
                    </div>

                    {/* Input fields based on parameters */}
                    <div className="space-y-4">
                        {uniqueParameterNames.map((paramName) => (
                            <div key={paramName} className="space-y-2">
                                <Label>{paramName}</Label>
                                <Textarea
                                    value={testcase.input?.[paramName] || ""}
                                    onChange={(e) => handleTestcaseChange(index, paramName, e.target.value)}
                                    placeholder={`Enter value for ${paramName}`}
                                    rows={2}
                                />
                            </div>
                        ))}

                        <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                                value={testcase.output || ""}
                                onChange={(e) => handleTestcaseChange(index, "output", e.target.value)}
                                placeholder="Enter expected output"
                                rows={2}
                            />
                        </div>
                    </div>
                </Card>
            ))}
            <Button type="button" variant="outline" onClick={handleAddTestcase}>
                Add Test Case
            </Button>
        </div>
    );
} 