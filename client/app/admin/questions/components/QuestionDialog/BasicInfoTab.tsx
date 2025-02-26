"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BasicInfo } from "../../utils/types";

interface BasicInfoTabProps {
    basicInfo: BasicInfo;
    setBasicInfo: React.Dispatch<React.SetStateAction<BasicInfo>>;
}

export default function BasicInfoTab({ basicInfo, setBasicInfo }: BasicInfoTabProps) {
    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    value={basicInfo.title}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, title: e.target.value }))}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Category (comma separated)</Label>
                <Input
                    id="category"
                    name="category"
                    value={basicInfo.category}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, category: e.target.value }))}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="companies">Companies (comma separated, optional)</Label>
                <Input
                    id="companies"
                    name="companies"
                    value={basicInfo.companies}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, companies: e.target.value }))}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="questionSets">Question Sets (comma separated, optional)</Label>
                <Input
                    id="questionSets"
                    name="questionSets"
                    value={basicInfo.questionSets}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, questionSets: e.target.value }))}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty (1-3)</Label>
                <Input
                    id="difficulty"
                    name="difficulty"
                    type="number"
                    min={1}
                    max={3}
                    value={basicInfo.difficulty}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, difficulty: Number(e.target.value) }))}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="functionName">Function Name</Label>
                <Input
                    id="functionName"
                    name="functionName"
                    value={basicInfo.functionName}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, functionName: e.target.value }))}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="question">Question Content</Label>
                <div className="relative max-h-[400px] overflow-hidden">
                    <Textarea
                        id="question"
                        name="question"
                        rows={10}
                        value={basicInfo.question}
                        onChange={(e) => setBasicInfo(prev => ({ ...prev, question: e.target.value }))}
                        required
                        className="resize-none h-full max-h-[400px] overflow-y-auto"
                    />
                </div>
            </div>
        </div>
    );
} 