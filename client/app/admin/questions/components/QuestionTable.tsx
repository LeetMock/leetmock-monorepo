"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { QuestionDoc } from "../utils/types";

interface QuestionTableProps {
    questions: QuestionDoc[];
    onEdit: (question: QuestionDoc) => void;
    onPreview: (question: QuestionDoc) => void;
    onDelete: (questionId: Id<"questions">) => void;
}

export default function QuestionTable({
    questions,
    onEdit,
    onPreview,
    onDelete
}: QuestionTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Test Cases</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questions.map((question) => (
                    <TableRow key={question._id}>
                        <TableCell className="font-medium">{question.title}</TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
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
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">
                                {question.tests?.length || 0} cases
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onPreview(question)}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(question)}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(question._id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {questions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No questions found matching your filters
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
} 