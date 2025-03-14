"use client";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Id } from "@/convex/_generated/dataModel";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface QuestionSetTableProps {
    questionSets: {
        _id: Id<"codingQuestionSets">;
        name: string;
        questions: Id<"questions">[];
    }[];
    onEdit: (questionSet: { id: Id<"codingQuestionSets">, name: string, questions: Id<"questions">[] }) => void;
    onDelete: (id: Id<"codingQuestionSets">) => void;
}

export default function QuestionSetTable({
    questionSets,
    onEdit,
    onDelete
}: QuestionSetTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Questions Count</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {questionSets.map((set) => (
                    <TableRow key={set._id}>
                        <TableCell className="font-medium">{set.name}</TableCell>
                        <TableCell>
                            <Badge variant="secondary">
                                {set.questions?.length || 0} questions
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit({
                                        id: set._id,
                                        name: set.name,
                                        questions: set.questions || []
                                    })}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(set._id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
                {questionSets.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No question sets found
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
} 