"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DashboardBreadcrumb } from "@/app/(workspace)/dashboard/_components/breadcrumb";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useQuestionStore } from "@/hooks/use-question-store";
import QuestionList from "@/app/(workspace)/dashboard/coding/_components/questionList";

const StudyPlanPage = () => {
    const params = useParams();
    const id = params.id as string;
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const {
        completedQuestions,
        starredQuestions,
        updateStatus,
        updateStarred,
    } = useQuestionStore();

    // Get study set data based on ID
    const studySet = useQuery(api.codingQuestionSet.getSetById, { id });

    // Get questions for the study set
    const questions = useQuery(api.questions.listBySetId, { setId: id });

    useEffect(() => {
        if (studySet) {
            setTitle(studySet.name || "Study Plan");
            setDescription(studySet.name || "");
        }
    }, [studySet]);

    return (
        <div className="flex flex-col">
            <DashboardBreadcrumb className="h-12 px-6 bg-background/80 backdrop-blur-sm rounded-t-md" />

            <div className="p-6 space-y-6">
                <div className="mb-6">
                    <Link href="/dashboard/coding">
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Coding
                        </Button>
                    </Link>
                </div>

                {questions && (
                    <div className="relative p-6 rounded-xl flex items-center space-x-8 max-w-3xl mx-auto mb-8">
                        {/* 3D Gradient Badge */}
                        <div className="relative h-20 w-24 flex-shrink-0">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-teal-300 via-cyan-400 to-blue-500 shadow-lg transform rotate-3 scale-105"></div>
                            <div className="absolute inset-0 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-blue-600 text-2xl">TOP</span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="mb-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span className="inline-flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-1 text-teal-500" />
                                    Must-do List for Interview Prep
                                </span>
                            </div>

                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                                {title}
                            </h3>

                            {/* Progress Bar */}
                            <div className="relative pt-1 w-full">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-1000 ease-out-expo"
                                        style={{
                                            width: `${Math.round((completedQuestions.size / questions.length) * 100)}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="text-base font-semibold text-blue-600 dark:text-blue-400">
                                        {completedQuestions.size} <span className="text-gray-500 dark:text-gray-400 font-normal">/ {questions.length}</span>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-300 to-blue-500 p-0.5">
                                            <div className="w-full h-full bg-white dark:bg-gray-800 rounded flex items-center justify-center">
                                                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                                                    {Math.round((completedQuestions.size / questions.length) * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                        <span>Track your progress</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
                        <span>Practice common interview questions</span>
                    </div>
                </div>

                {questions && questions.length > 0 ? (
                    <QuestionList
                        questions={questions}
                        updateStatus={updateStatus}
                        updateStarred={updateStarred}
                        completedQuestions={completedQuestions}
                        starredQuestions={starredQuestions}
                    />
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No questions available for this study plan.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyPlanPage; 