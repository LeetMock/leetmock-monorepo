"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";

interface DeleteDialogProps {
    questionId: Id<"questions"> | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: (questionId: Id<"questions">) => void;
}

export default function DeleteDialog({
    questionId,
    onOpenChange,
    onConfirm
}: DeleteDialogProps) {
    return (
        <AlertDialog
            open={!!questionId}
            onOpenChange={(open) => !open && onOpenChange(false)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the question
                        and all its associated data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => questionId && onConfirm(questionId)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
} 