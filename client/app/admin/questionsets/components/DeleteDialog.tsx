"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
    questionSetId: Id<"codingQuestionSets"> | null;
    onOpenChange: () => void;
    onConfirm: (id: Id<"codingQuestionSets">) => void;
}

export default function DeleteDialog({
    questionSetId,
    onOpenChange,
    onConfirm,
}: DeleteDialogProps) {
    return (
        <Dialog open={!!questionSetId} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Question Set</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this question set? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onOpenChange}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => questionSetId && onConfirm(questionSetId)}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 