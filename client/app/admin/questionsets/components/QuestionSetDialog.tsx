"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

interface QuestionSetDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingQuestionSet: { id: Id<"codingQuestionSets">, name: string, questions: Id<"questions">[] } | null;
    allQuestions: {
        _id: Id<"questions">;
        title: string;
        difficulty: number;
        category?: string[];
    }[];
    onSubmit: (name: string, selectedQuestions: Id<"questions">[]) => Promise<void>;
    isSubmitting: boolean;
}

export default function QuestionSetDialog({
    open,
    onOpenChange,
    editingQuestionSet,
    allQuestions,
    onSubmit,
    isSubmitting
}: QuestionSetDialogProps) {
    const [name, setName] = useState("");
    const [selectedQuestions, setSelectedQuestions] = useState<Id<"questions">[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open && editingQuestionSet) {
            setName(editingQuestionSet.name);
            setSelectedQuestions(editingQuestionSet.questions);
        } else if (open) {
            setName("");
            setSelectedQuestions([]);
        }
    }, [open, editingQuestionSet]);

    // Filter questions based on search term
    const filteredQuestions = allQuestions.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle question selection
    const toggleQuestionSelection = (questionId: Id<"questions">) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) return;
        await onSubmit(name, selectedQuestions);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingQuestionSet ? "Edit Question Set" : "Create New Question Set"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Question Set Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter a name for this question set"
                                required
                                disabled={!!editingQuestionSet}
                            />
                        </div>

                        <div>
                            <Label>Select Questions ({selectedQuestions.length} selected)</Label>
                            <div className="border rounded-md mt-1">
                                <Command>
                                    <CommandInput
                                        placeholder="Search questions..."
                                        value={searchTerm}
                                        onValueChange={setSearchTerm}
                                    />
                                    <CommandList>
                                        <CommandEmpty>No questions found</CommandEmpty>
                                        <CommandGroup>
                                            <ScrollArea className="h-72">
                                                {filteredQuestions.map(question => (
                                                    <CommandItem
                                                        key={question._id}
                                                        onSelect={() => toggleQuestionSelection(question._id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <div className={`flex-shrink-0 h-4 w-4 rounded border ${selectedQuestions.includes(question._id)
                                                            ? 'bg-primary border-primary'
                                                            : 'border-input'
                                                            }`}>
                                                            {selectedQuestions.includes(question._id) && (
                                                                <Check className="h-3 w-3 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <span>{question.title}</span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`ml-auto ${question.difficulty === 1 ? 'bg-green-50 text-green-700' :
                                                                question.difficulty === 2 ? 'bg-yellow-50 text-yellow-700' :
                                                                    'bg-red-50 text-red-700'
                                                                }`}
                                                        >
                                                            {question.difficulty === 1 ? 'Easy' :
                                                                question.difficulty === 2 ? 'Medium' :
                                                                    'Hard'}
                                                        </Badge>
                                                    </CommandItem>
                                                ))}
                                            </ScrollArea>
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || !name.trim()}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingQuestionSet ? "Update" : "Create"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 