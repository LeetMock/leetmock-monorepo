"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { QuestionDoc } from "../utils/types";
import { formatJSON, formatQuestionContent } from "../utils/formatters";

interface PreviewDialogProps {
    question: QuestionDoc | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PreviewDialog({
    question,
    open,
    onOpenChange
}: PreviewDialogProps) {
    if (!question) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {question.title}
                        <div className="flex items-center gap-1 ml-2">
                            {question.category?.map((cat) => (
                                <Badge
                                    key={cat}
                                    variant="secondary"
                                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    {cat}
                                </Badge>
                            ))}
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={cn(
                                question.difficulty === 1 && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                                question.difficulty === 2 && "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                                question.difficulty === 3 && "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            )}
                        >
                            {question.difficulty === 1 && "Easy"}
                            {question.difficulty === 2 && "Medium"}
                            {question.difficulty === 3 && "Hard"}
                        </Badge>
                        <Badge variant="secondary">
                            {question.tests?.length || 0} test cases
                        </Badge>
                    </div>

                    {/* Function Signature */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">Function Signature</h3>
                            <Badge variant="outline" className="ml-2">
                                {question.evalMode === "exactMatch" && "Exact Match"}
                                {question.evalMode === "listNodeIter" && "List Node Iterator"}
                                {question.evalMode === "sortedMatch" && "Sorted Match"}
                            </Badge>
                        </div>
                        <Card className="p-4">
                            <div className="font-mono text-sm">
                                <span className="text-blue-500 dark:text-blue-400">function</span>{" "}
                                <span className="text-yellow-600 dark:text-yellow-400">{question.functionName}</span>
                                {" "}<span className="text-gray-500 dark:text-gray-400">&gt;</span>{" "}
                                <span className="text-green-600 dark:text-green-400">
                                    {question.outputParameters}
                                </span>
                            </div>
                        </Card>
                    </div>

                    {/* Input Parameters */}
                    <div>
                        <h3 className="font-medium mb-2">Input Parameters</h3>
                        <Card className="p-4">
                            <div className="space-y-2">
                                {Object.entries(question.inputParameters || {}).map(([name, value]) => (
                                    <div key={name} className="font-mono text-sm">
                                        <span className="text-yellow-600 dark:text-yellow-400">{name}</span>:{" "}
                                        <span className="text-green-600 dark:text-green-400">
                                            {JSON.stringify(value, null, 2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Question Content */}
                    <div>
                        <h3 className="font-medium mb-2">Question Content</h3>
                        <div className="border rounded-lg">
                            <div className="relative bg-background p-4">
                                <div className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown>
                                        {formatQuestionContent(question.question || "")}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Cases */}
                    <div>
                        <h3 className="font-medium mb-2">Test Cases</h3>
                        <div className="space-y-4">
                            {question.tests?.map((testcase, index) => (
                                <Card key={index} className="p-4">
                                    <h4 className="font-medium mb-2">Test Case {index + 1}</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm font-medium">Input:</span>
                                            <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                                                {formatJSON(testcase.input)}
                                            </pre>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">Expected Output:</span>
                                            <pre className="mt-1 p-2 bg-muted rounded-md overflow-x-auto">
                                                {formatJSON(testcase.output)}
                                            </pre>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 