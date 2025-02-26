"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImportIcon, Loader2 } from "lucide-react";

interface ImportSectionProps {
    importTitle: string;
    setImportTitle: (title: string) => void;
    onImport: () => Promise<void>;
    isImporting: boolean;
}

export default function ImportSection({
    importTitle,
    setImportTitle,
    onImport,
    isImporting
}: ImportSectionProps) {
    return (
        <div className="flex items-center gap-2 mb-4 p-3 border rounded-md bg-muted/30">
            <div className="flex-1">
                <Label htmlFor="importTitle">Import from LeetCode</Label>
                <div className="flex gap-2 mt-1">
                    <Input
                        id="importTitle"
                        placeholder="Enter question title or slug (e.g., 'two-sum')"
                        value={importTitle}
                        onChange={(e) => setImportTitle(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onImport}
                        disabled={isImporting}
                    >
                        {isImporting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <ImportIcon className="h-4 w-4 mr-2" />
                        )}
                        Import
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Enter a LeetCode question title to automatically import its details
                </p>
            </div>
        </div>
    );
} 