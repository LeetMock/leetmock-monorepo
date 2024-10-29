import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Testcase } from '@/lib/types';

interface TestcaseEditorProps {
    testcases: Testcase[];
    activeTab: string;
    connectionState: string;
    onTestcasesChange: (testcases: Testcase[]) => void;
    onActiveTabChange: (tab: string) => void;
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
}) => {
    const inputKeys = getInputKeys(testcases);
    const isConnected = connectionState === "connected";

    const handleTestcaseChange = (index: number, key: string, value: any) => {
        if (!isConnected) {
            toast.error("You are not connected to the interview room.");
            return;
        }

        const updatedTestcases = testcases.map((testcase, i) =>
            i === index ? {
                ...testcase,
                input: { ...testcase.input, [key]: tryParseValue(value) }
            } : testcase
        );
        onTestcasesChange(updatedTestcases);
    };

    const tryParseValue = (value: string): any => {
        if (value.trim() === '') {
            return '';
        }

        try {
            if (value.startsWith('[') && value.endsWith(']')) {
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
            input: inputKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
        };
        const updatedTestcases = [...testcases, newTestcase];
        onTestcasesChange(updatedTestcases);
        onActiveTabChange((testcases.length + 1).toString());
    };

    const deleteTestcase = (indexToDelete: number) => {
        if (!isConnected) {
            toast.error("You are not connected to the interview room.");
            return;
        }

        const updatedTestcases = testcases.filter((_, index) => index !== indexToDelete);
        onTestcasesChange(updatedTestcases);
        onActiveTabChange("1"); // Reset to first tab after deletion
    };

    return (
        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
            <TabsList className="bg-background/95 p-1">
                {testcases.map((_, index) => (
                    <div key={index + 1} className="flex items-center">
                        <TabsTrigger
                            value={(index + 1).toString()}
                            className="px-3 py-1.5 text-sm font-medium"
                            disabled={!isConnected}
                        >
                            Case {index + 1}
                        </TabsTrigger>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTestcase(index);
                            }}
                            className="ml-1 p-1 h-7 w-7"
                            disabled={!isConnected || testcases.length <= 1}
                        >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                        </Button>
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
            </TabsList>
            {testcases.map((testcase, index) => (
                <TabsContent key={index} value={(index + 1).toString()} className="mt-4 space-y-4">
                    {inputKeys.map((key) => (
                        <div key={key}>
                            <label htmlFor={`${key}-${index}`} className="block text-sm font-medium mb-1">
                                {key} =
                            </label>
                            <Input
                                id={`${key}-${index}`}
                                value={Array.isArray(testcase.input[key])
                                    ? JSON.stringify(testcase.input[key])
                                    : String(testcase.input[key] ?? '')}
                                onChange={(e) => handleTestcaseChange(index, key, e.target.value)}
                                className="bg-secondary/50"
                                disabled={!isConnected}
                            />
                        </div>
                    ))}
                </TabsContent>
            ))}
        </Tabs>
    );
};
