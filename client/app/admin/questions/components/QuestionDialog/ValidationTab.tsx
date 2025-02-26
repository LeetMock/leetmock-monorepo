"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Play, Sparkles } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface ValidationTabProps {
    validationCode: string;
    setValidationCode: React.Dispatch<React.SetStateAction<string>>;
    validationOutput: string;
    validationLanguage: string;
    setValidationLanguage: React.Dispatch<React.SetStateAction<string>>;
    validationLanguages: string[];
    isValidating: boolean;
    handleRunValidation: () => Promise<void>;
    selectedSolutionLanguage: string;
    setSelectedSolutionLanguage: React.Dispatch<React.SetStateAction<string>>;
    isSolutionGenerating: boolean;
    handleGenerateSolution: () => Promise<void>;
}

export default function ValidationTab({
    validationCode,
    setValidationCode,
    validationOutput,
    validationLanguage,
    setValidationLanguage,
    validationLanguages,
    isValidating,
    handleRunValidation,
    selectedSolutionLanguage,
    setSelectedSolutionLanguage,
    isSolutionGenerating,
    handleGenerateSolution
}: ValidationTabProps) {
    const { theme } = useTheme();

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Label htmlFor="validationLanguage">Language</Label>
                    <Select
                        value={validationLanguage}
                        onValueChange={setValidationLanguage}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2">
                    {/* Add solution generation UI */}
                    <div className="flex items-center gap-2">
                        <Select
                            value={selectedSolutionLanguage}
                            onValueChange={setSelectedSolutionLanguage}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Generate in" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerateSolution}
                            disabled={isSolutionGenerating}
                        >
                            {isSolutionGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Sparkles className="h-4 w-4 mr-2" />
                            )}
                            Generate Solution
                        </Button>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleRunValidation}
                        disabled={isValidating || !validationCode.trim()}
                    >
                        {isValidating ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <>
                                <Play className="h-3.5 w-3.5 mr-1" />
                                <span>Run Tests</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Rest of the validation tab content */}
            <div className="grid grid-rows-2 gap-4 h-[800px] max-w-full overflow-x-auto">
                {/* Top Section - Code Editor */}
                <Card className="p-4 flex flex-col min-w-[800px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Validation Code</h3>
                        <div className="flex items-center gap-2">
                            <Select
                                value={validationLanguage}
                                onValueChange={setValidationLanguage}
                            >
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {validationLanguages.map((lang) => (
                                        <SelectItem key={lang} value={lang}>
                                            {lang}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex-1 relative min-h-0 overflow-x-auto">
                        <Editor
                            className="absolute inset-0"
                            language={validationLanguage || "python"}
                            theme={theme === "dark" ? "vs-dark" : "vs-light"}
                            value={validationCode}
                            options={{
                                fontSize: 14,
                                lineNumbers: "on",
                                roundedSelection: false,
                                scrollBeyondLastLine: false,
                                minimap: {
                                    enabled: false,
                                },
                                wordWrap: "off",
                            }}
                            onChange={(value) => setValidationCode(value || "")}
                        />
                    </div>
                </Card>

                {/* Bottom Section - Output Panel */}
                <Card className="p-4 flex flex-col min-w-[800px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Test Results</h3>
                        <Button
                            variant="outline"
                            className="h-8"
                            onClick={handleRunValidation}
                            disabled={isValidating}
                        >
                            {isValidating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Play className="h-3.5 w-3.5 mr-1" />
                                    <span>Run Tests</span>
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 max-h-[300px] w-full overflow-hidden">
                        <div className="h-full w-full border rounded-md bg-muted/50 overflow-auto">
                            <pre className="p-4 text-sm whitespace-pre">
                                {validationOutput}
                            </pre>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
} 