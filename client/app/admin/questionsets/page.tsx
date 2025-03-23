"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import QuestionSetTable from "./components/QuestionSetTable";
import QuestionSetDialog from "./components/QuestionSetDialog";
import DeleteDialog from "./components/DeleteDialog";

export default function QuestionSetsManagementPage() {
    // State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuestionSet, setEditingQuestionSet] = useState<{ id: Id<"codingQuestionSets">, name: string, questions: Id<"questions">[] } | null>(null);
    const [questionSetToDelete, setQuestionSetToDelete] = useState<Id<"codingQuestionSets"> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch data
    const questionSets = useQuery(api.codingQuestionSet.getAllCodingQuestionSets) || [];
    const allQuestions = useQuery(api.questions.getAll) || [];

    // Mutations
    const createQuestionSet = useMutation(api.codingQuestionSet.createCodingQuestionSet);
    const addQuestion = useMutation(api.codingQuestionSet.addQuestionToCodingQuestionSet);
    const removeQuestion = useMutation(api.codingQuestionSet.removeQuestionFromCodingQuestionSet);

    // Handler for creating/editing a question set
    const handleSubmit = async (name: string, selectedQuestions: Id<"questions">[]) => {
        setIsSubmitting(true);

        try {
            if (editingQuestionSet) {
                // For editing, remove questions no longer in the set and add new ones
                const questionsToRemove = editingQuestionSet.questions.filter(
                    q => !selectedQuestions.includes(q)
                );

                const questionsToAdd = selectedQuestions.filter(
                    q => !editingQuestionSet.questions.includes(q)
                );

                // Remove questions no longer in the set
                for (const questionId of questionsToRemove) {
                    await removeQuestion({
                        codingQuestionSetName: editingQuestionSet.name,
                        questionId
                    });
                }

                // Add new questions to the set
                for (const questionId of questionsToAdd) {
                    await addQuestion({
                        codingQuestionSetName: editingQuestionSet.name,
                        questionId
                    });
                }

                toast.success("Question set updated successfully");
            } else {
                // For new question sets
                const result = await createQuestionSet({
                    name,
                    questions: selectedQuestions,
                });

                if (result) {
                    toast.success("Question set created successfully");
                } else {
                    toast.error("A question set with this name already exists");
                }
            }

            setIsDialogOpen(false);
            setEditingQuestionSet(null);
        } catch (error) {
            toast.error(`Failed to save question set: ${error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handler for deleting a question set
    const handleDelete = async (id: Id<"codingQuestionSets">) => {
        // Implement delete functionality when available in the backend
        toast.error("Delete functionality not implemented yet");
        setQuestionSetToDelete(null);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Question Sets Management</h1>
                <Button onClick={() => {
                    setEditingQuestionSet(null);
                    setIsDialogOpen(true);
                }}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Question Set
                </Button>
            </div>

            <div className="border rounded-lg">
                <QuestionSetTable
                    questionSets={questionSets}
                    onEdit={(questionSet) => {
                        setEditingQuestionSet(questionSet);
                        setIsDialogOpen(true);
                    }}
                    onDelete={(id) => setQuestionSetToDelete(id)}
                />
            </div>

            {/* Question Set Dialog */}
            <QuestionSetDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingQuestionSet={editingQuestionSet}
                allQuestions={allQuestions}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                questionSetId={questionSetToDelete}
                onOpenChange={() => setQuestionSetToDelete(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
} 