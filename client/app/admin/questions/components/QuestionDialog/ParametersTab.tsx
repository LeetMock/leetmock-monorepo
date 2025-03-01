"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { EvalMode, InputParameters } from "../../utils/types";
import { commonOutputTypes } from "../../utils/helpers";

interface ParametersTabProps {
    parameters: string[];
    parameterTypes: InputParameters;
    setParameters: React.Dispatch<React.SetStateAction<string[]>>;
    setParameterTypes: React.Dispatch<React.SetStateAction<InputParameters>>;
    selectedOutputType: string;
    setSelectedOutputType: React.Dispatch<React.SetStateAction<string>>;
    evalMode: EvalMode;
    setEvalMode: React.Dispatch<React.SetStateAction<EvalMode>>;
    handleAddParameter: () => void;
    handleRemoveParameter: (index: number) => void;
    handleParameterChange: (index: number, newName: string) => void;
    handleParameterTypeChange: (paramName: string, language: 'cpp' | 'java' | 'javascript' | 'python', value: string) => void;
}

export default function ParametersTab({
    parameters,
    parameterTypes,
    setParameters,
    setParameterTypes,
    selectedOutputType,
    setSelectedOutputType,
    evalMode,
    setEvalMode,
    handleAddParameter,
    handleRemoveParameter,
    handleParameterChange,
    handleParameterTypeChange
}: ParametersTabProps) {
    // Define supported languages for type selection
    const supportedLanguages = [
        {
            id: 'cpp', label: 'C++', options: [
                { value: 'string', label: 'string' },
                { value: 'int', label: 'int' },
                { value: 'bool', label: 'bool' },
                { value: 'vector<int>', label: 'vector<int>' },
                { value: 'vector<string>', label: 'vector<string>' },
            ]
        },
        {
            id: 'java', label: 'Java', options: [
                { value: 'String', label: 'String' },
                { value: 'int', label: 'int' },
                { value: 'boolean', label: 'boolean' },
                { value: 'int[]', label: 'int[]' },
                { value: 'String[]', label: 'String[]' },
            ]
        },
        {
            id: 'javascript', label: 'JavaScript', options: [
                { value: 'string', label: 'string' },
                { value: 'number', label: 'number' },
                { value: 'boolean', label: 'boolean' },
                { value: 'number[]', label: 'number[]' },
                { value: 'string[]', label: 'string[]' },
            ]
        },
        {
            id: 'python', label: 'Python', options: [
                { value: 'str', label: 'str' },
                { value: 'int', label: 'int' },
                { value: 'bool', label: 'bool' },
                { value: 'List[int]', label: 'List[int]' },
                { value: 'List[str]', label: 'List[str]' },
            ]
        },
    ];

    // Get all unique parameter names across all languages
    const allParameterNames = Object.values(parameterTypes).flatMap(params => Object.keys(params));
    const uniqueParameterNames = Array.from(new Set(allParameterNames));

    console.log(parameterTypes);
    return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Input Parameters</h3>
                    <Button type="button" variant="outline" onClick={handleAddParameter}>
                        Add Parameter
                    </Button>
                </div>

                {uniqueParameterNames.map((paramName, index) => (
                    <Card key={index} className="p-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <Label>Parameter Name</Label>
                                <Input
                                    value={paramName}
                                    onChange={(e) => handleParameterChange(index, e.target.value)}
                                    placeholder="e.g., nums"
                                />
                            </div>
                            {index > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveParameter(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label>Parameter Types</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {supportedLanguages.map(language => (
                                    <div key={language.id} className="flex items-center gap-2">
                                        <span className="w-24 text-sm font-medium">{language.label}:</span>
                                        <Select
                                            value={parameterTypes[language.id]?.[paramName] || ""}
                                            onValueChange={(value) => handleParameterTypeChange(paramName, language.id as any, value)}
                                        >
                                            <SelectTrigger className="flex-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {language.options.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}

                <div className="space-y-2">
                    <Label>Output Type</Label>
                    <div className="flex gap-2">
                        <Select
                            name="outputType"
                            value={commonOutputTypes.some(t => t.value === selectedOutputType) ? selectedOutputType : "custom"}
                            onValueChange={(value) => {
                                if (value === "custom") {
                                    // Don't update selectedOutputType for custom option
                                    return;
                                }
                                setSelectedOutputType(value);
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {commonOutputTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex-1">
                            <Input
                                id="customOutputType"
                                name="outputType"
                                placeholder="Custom type (e.g., List[Tuple[int, str]])"
                                value={selectedOutputType}
                                onChange={(e) => {
                                    setSelectedOutputType(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Select a common type or enter a custom type
                    </p>
                </div>
                <div className="space-y-2">
                    <Label>Evaluation Mode</Label>
                    <Select
                        value={evalMode}
                        onValueChange={(value: EvalMode) => setEvalMode(value)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exactMatch">Exact Match</SelectItem>
                            <SelectItem value="listNodeIter">List Node Iterator</SelectItem>
                            <SelectItem value="sortedMatch">Sorted Match</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                        Select how to evaluate the test cases
                    </p>
                </div>
            </div>
        </div>
    );
} 