import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, VOICES } from "@/lib/constants";

export const CodeInterviewConfig: React.FC = () => {
    return (
        <div className="p-4 border rounded-md shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Interview Configuration</h3>
            <div className="text-lg">No Config Ale</div>
            <div className="text-sm text-muted-foreground">
                You can configure your interview later.
            </div>
        </div>
    );
};
