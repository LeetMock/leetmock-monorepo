"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Testcase } from "../../utils/types";

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

    // Helper function to format value for display
    const formatValueForDisplay = (value: any): string => {
        // Handle null/undefined
        if (value === null || value === undefined) {
            return "";
        }

        try {
            // If it's already a string, return it directly
            // This preserves the raw string format for editing
            if (typeof value === 'string') {
                return value;
            }

            // Handle arrays
            if (Array.isArray(value)) {
                return JSON.stringify(value);
            }

            // Handle objects (including dictionaries)
            if (typeof value === 'object') {
                return JSON.stringify(value);
            }

            // Handle booleans specifically
            if (typeof value === 'boolean') {
                return value ? "true" : "false";
            }

            // Handle numbers
            if (typeof value === 'number') {
                return value.toString();
            }

            // Fallback for any other types
            return String(value);
        } catch (error) {
            console.error("Error formatting value:", error);
            // Return the original value as a string if formatting fails
            return String(value);
        }
    };

    // Helper function to check if a parameter is an array type
    const isArrayType = (paramName: string) => {
        return Object.values(parameterTypes).some(typeMap =>
            typeMap[paramName]?.includes('[]') ||
            typeMap[paramName]?.includes('List') ||
            typeMap[paramName]?.includes('vector')
        );
    };

    // Helper function to check if a parameter is an object type
    const isObjectType = (paramName: string) => {
        return Object.values(parameterTypes).some(typeMap =>
            typeMap[paramName]?.includes('Map') ||
            typeMap[paramName]?.includes('dict') ||
            typeMap[paramName]?.includes('object')
        );
    };

    // Function to get parameter type hint
    const getTypeHint = (paramName: string): string => {
        const jsType = parameterTypes.javascript[paramName];
        const pyType = parameterTypes.python[paramName];

        if (jsType?.includes('[]') || pyType?.includes('List')) {
            return "Array format: [1, 2, 3] or [\"a\", \"b\", \"c\"]";
        }

        if (jsType?.includes('object') || pyType?.includes('dict')) {
            return "Object format: {\"key\": \"value\", \"key2\": 123}";
        }

        if (jsType?.includes('number') || pyType?.includes('int') || pyType?.includes('float')) {
            return "Numeric value (e.g., 42, 3.14)";
        }

        if (jsType?.includes('boolean') || pyType?.includes('bool')) {
            return "Boolean value (true or false)";
        }

        return "";
    };

    // Function to remove a testcase
    const removeTestcase = (index: number) => {
        const newTestcases = [...testcases];
        newTestcases.splice(index, 1);
        setTestcases(newTestcases);
    };

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            {testcases.map((testcase, index) => (
                <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Test Case {index + 1}</h3>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTestcase(index)}
                        >
                            Remove
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {parameters.map((param) => (
                            <div key={param} className="space-y-2">
                                <Label>{param}</Label>
                                <Textarea
                                    value={formatValueForDisplay(testcase.input?.[param])}
                                    onChange={(e) => handleTestcaseChange(index, param, e.target.value)}
                                    placeholder={`Enter ${param} value`}
                                    rows={2}
                                    className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format according to type: {getTypeHint(param)}
                                </p>
                            </div>
                        ))}
                        <div className="space-y-2">
                            <Label>Expected Output</Label>
                            <Textarea
                                value={formatValueForDisplay(testcase.output)}
                                onChange={(e) => handleTestcaseChange(index, "output", e.target.value)}
                                placeholder="Enter expected output"
                                rows={2}
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Format output according to the selected output type: {selectedOutputType}
                                {isArrayType("output") && " (e.g., [1, 2, 3])"}
                                {isObjectType("output") && " (e.g., {\"key\": \"value\"})"}
                            </p>
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