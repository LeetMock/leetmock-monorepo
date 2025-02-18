import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckCircle2, Circle, Clock, AlertCircle, PlayCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback } from "react";

interface QuestionListProps {
    questions: any[]; // Replace 'any' with your actual Question type
    updateStatus: any; // Replace 'any' with the actual mutation type
    updateStarred: any; // Replace 'any' with the actual mutation type
    completedQuestions: Set<Id<"questions">>; // Changed to Set
    starredQuestions: Set<Id<"questions">>;
}

export default function QuestionList({ questions, updateStatus, updateStarred, completedQuestions, starredQuestions }: QuestionListProps) {
    const isQuestionCompleted = useCallback((questionId: Id<"questions">) => {
        return completedQuestions.has(questionId); // O(1) time complexity
    }, [completedQuestions]);

    const isQuestionStarred = useCallback((questionId: Id<"questions">) => {
        return starredQuestions.has(questionId); // O(1) time complexity
    }, [starredQuestions]);

    const StatusButton = ({ questionId }: { questionId: Id<"questions"> }) => {
        const completed = isQuestionCompleted(questionId);

        const handleClick = async () => {
            await updateStatus({ questionId, status: completed ? "incomplete" : "complete" });
        };

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                        onClick={handleClick}
                    >
                        {completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <span className="text-xs">
                        {completed ? "Completed" : "Mark as complete"}
                    </span>
                </TooltipContent>
            </Tooltip>
        );
    };

    const StarButton = ({ questionId }: { questionId: Id<"questions"> }) => {
        const starred = isQuestionStarred(questionId);

        const handleClick = async () => {
            await updateStarred({ questionId, starred: !starred });
        };

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
                        onClick={handleClick}
                    >
                        <Star
                            className={`h-5 w-5 ${starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                    <span className="text-xs">
                        {starred ? 'Unstar question' : 'Star question'}
                    </span>
                </TooltipContent>
            </Tooltip>
        );
    };

    return (
        <TooltipProvider>
            <div className="mt-4">
                <div className="rounded-lg border shadow-sm">
                    {/* Header Row */}
                    <div className="flex items-center p-4 bg-gray-50 border-b text-gray-500">
                        <div className="flex-shrink-0 w-[80px]">
                            <span className="text-xs font-medium uppercase tracking-wider">Status</span>
                        </div>
                        <div className="flex-shrink-0 w-[80px]">
                            <span className="text-xs font-medium uppercase tracking-wider">Star</span>
                        </div>
                        <div className="flex-shrink-0 w-[120px]">
                            <span className="text-xs font-medium uppercase tracking-wider">Difficulty</span>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <span className="text-xs font-medium uppercase tracking-wider">Title</span>
                        </div>
                        <div className="flex-shrink-0 w-[80px]">
                            <span className="text-xs font-medium uppercase tracking-wider">Action</span>
                        </div>
                    </div>

                    {/* Question Rows */}
                    {questions.map((question, index) => (
                        <div
                            key={question._id}
                            className={`flex items-center p-4 hover:bg-gray-50/30 transition-colors
                                ${index !== questions.length - 1 ? 'border-b' : ''}
                                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                            `}
                        >
                            {/* Status Button */}
                            <div className="flex-shrink-0 w-[80px]">
                                <StatusButton questionId={question._id} />
                            </div>

                            {/* Star Button */}
                            <div className="flex-shrink-0 w-[80px]">
                                <StarButton questionId={question._id} />
                            </div>

                            {/* Difficulty */}
                            <div className="flex-shrink-0 w-[120px]">
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium
                                    ${question.difficulty === 1
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : question.difficulty === 2
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-rose-100 text-rose-800'
                                    }`}>
                                    {question.difficulty === 1 ? 'Easy' :
                                        question.difficulty === 2 ? 'Medium' :
                                            'Hard'}
                                </span>
                            </div>

                            {/* Title */}
                            <div className="flex-1 min-w-[200px]">
                                <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors underline-offset-4 hover:underline truncate">
                                    {question.title}
                                </h3>
                            </div>

                            {/* Mock Button */}
                            <div className="flex-shrink-0 w-[80px]">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        >
                                            <PlayCircle className="h-5 w-5 text-blue-500 hover:text-blue-600" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <span className="text-xs">Start mock interview</span>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>

                {questions.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        No questions available. Add your first question to get started.
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
} 