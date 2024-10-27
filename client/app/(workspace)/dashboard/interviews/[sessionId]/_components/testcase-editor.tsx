import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Testcase } from '@/lib/types';

interface TestcaseEditorProps {
    initialTestcases: Testcase[];
    onTestcasesChange: (testcases: Testcase[]) => void;
    inputKeys: string[]; // Array of keys expected in the input object
}

export const TestcaseEditor: React.FC<TestcaseEditorProps> = ({
    initialTestcases,
    onTestcasesChange,
    inputKeys,
}) => {
    const [testcases, setTestcases] = useState<Testcase[]>(initialTestcases);
    const [activeTab, setActiveTab] = useState(initialTestcases[0]?.id || '');

    const handleTestcaseChange = (id: string, key: string, value: string) => {
        const updatedTestcases = testcases.map(testcase =>
            testcase.id === id ? { ...testcase, input: { ...testcase.input, [key]: value } } : testcase
        );
        setTestcases(updatedTestcases);
        onTestcasesChange(updatedTestcases);
    };

    const addTestcase = () => {
        if (testcases.length >= 5) {
            toast.warning("You can create a maximum of 5 testcases.");
            return;
        }
        const newTestcase: Testcase = {
            id: `Case ${testcases.length + 1}`,
            input: inputKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {}),
        };
        setTestcases([...testcases, newTestcase]);
        setActiveTab(newTestcase.id);
        onTestcasesChange([...testcases, newTestcase]);
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-background/95 p-1">
                {testcases.map((testcase) => (
                    <TabsTrigger
                        key={testcase.id}
                        value={testcase.id}
                        className="px-3 py-1.5 text-sm font-medium"
                    >
                        {testcase.id}
                    </TabsTrigger>
                ))}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={addTestcase}
                    className="ml-2 p-1.5"
                    disabled={testcases.length >= 5}
                >
                    <PlusCircle className="h-4 w-4" />
                </Button>
            </TabsList>
            {testcases.map((testcase) => (
                <TabsContent key={testcase.id} value={testcase.id} className="mt-4 space-y-4">
                    {inputKeys.map((key) => (
                        <div key={key}>
                            <label htmlFor={`${key}-${testcase.id}`} className="block text-sm font-medium mb-1">
                                {key} =
                            </label>
                            <Input
                                id={`${key}-${testcase.id}`}
                                value={testcase.input[key] || ''}
                                onChange={(e) => handleTestcaseChange(testcase.id, key, e.target.value)}
                                className="bg-secondary/50"
                            />
                        </div>
                    ))}
                </TabsContent>
            ))}
        </Tabs>
    );
};
