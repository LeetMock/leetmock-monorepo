import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AVAILABLE_LANGUAGES, AVAILABLE_VOICES } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "./question-card";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const stageNameMapping = {
    background_discussion: "Background Discussion",
    coding: "Coding",
    eval: "Evaluation"
};

export const CodeInterviewConfig: React.FC<{ selectedQuestion: any }> = ({ selectedQuestion }) => {
    const [stages, setStages] = useState({
        background_discussion: false,
        coding: true,
        eval: false
    });
    const [language, setLanguage] = useState(AVAILABLE_LANGUAGES[0]);
    const [voice, setVoice] = useState(AVAILABLE_VOICES[0]);
    const [interviewTime, setInterviewTime] = useState(30);
    const [interviewTimeError, setInterviewTimeError] = useState('');
    const [mode, setMode] = useState('learning');

    const toggleStage = (stage: string) => {
        if (stage !== 'coding') {
            setStages(prev => ({ ...prev, [stage]: !prev[stage] }));
        }
    };

    const validateInterviewTime = (value: number) => {
        if (isNaN(value) || !Number.isInteger(value)) {
            setInterviewTimeError('Please enter a valid integer.');
        } else if (value < 10 || value > 70) {
            setInterviewTimeError('Interview time must be between 10 and 70 minutes.');
        } else {
            setInterviewTimeError('');
        }
    };

    const handleInterviewTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setInterviewTime(value);
        validateInterviewTime(value);
    };

    useEffect(() => {
        validateInterviewTime(interviewTime);
    }, [interviewTime]);

    return (
        <div className="w-full max-w-5xl mx-auto overflow-y-auto max-h-[calc(100vh-100px)]">
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 sticky top-0 z-10">
                <h2 className="text-2xl font-bold">Interview Configuration</h2>
            </div>
            <div className="space-y-8 p-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Interview Flow</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stages).map(([stage, isSelected]) => (
                            <Badge
                                key={stage}
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                    "cursor-pointer text-sm py-1 px-3 transition-all",
                                    stage === 'coding' ? 'opacity-50' : 'hover:bg-blue-100 hover:text-blue-800'
                                )}
                                onClick={() => toggleStage(stage)}
                            >
                                {stageNameMapping[stage]}
                            </Badge>
                        ))}
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Selected Question</h3>
                    <QuestionCard
                        _id={selectedQuestion._id}
                        title={selectedQuestion.title}
                        difficulty={selectedQuestion.difficulty}
                        category={selectedQuestion.category}
                        onQuestionSelected={() => { }}
                        isSelected={false}
                    />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="programming-language" className="text-sm font-medium">
                            Programming Language
                        </Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger id="programming-language" className="w-full">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_LANGUAGES.map((lang) => (
                                    <SelectItem key={lang} value={lang}>
                                        {lang}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ai-voice" className="text-sm font-medium">
                            AI Interviewer Voice
                        </Label>
                        <Select value={voice} onValueChange={setVoice}>
                            <SelectTrigger id="ai-voice" className="w-full">
                                <SelectValue placeholder="Select a voice" />
                            </SelectTrigger>
                            <SelectContent>
                                {AVAILABLE_VOICES.map((v) => (
                                    <SelectItem key={v} value={v}>
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <Label htmlFor="interview-time" className="text-sm font-medium">
                        Interview Time (minutes)
                    </Label>
                    <Input
                        id="interview-time"
                        type="number"
                        value={interviewTime}
                        onChange={handleInterviewTimeChange}
                        min={10}
                        max={70}
                        className={cn(
                            "w-full max-w-xs",
                            interviewTimeError && "border-red-500 focus:ring-red-500"
                        )}
                    />
                    {interviewTimeError && (
                        <p className="text-sm text-red-500 mt-1">{interviewTimeError}</p>
                    )}
                </div>

                <Separator />

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Interview Mode</h3>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="learning-mode"
                                checked={mode === 'learning'}
                                onCheckedChange={() => setMode('learning')}
                                className="h-5 w-5"
                            />
                            <label htmlFor="learning-mode" className="text-sm">Learning Mode</label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="strict-mode"
                                checked={mode === 'strict'}
                                onCheckedChange={() => setMode('strict')}
                                className="h-5 w-5"
                            />
                            <label htmlFor="strict-mode" className="text-sm">Strict Mode</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
