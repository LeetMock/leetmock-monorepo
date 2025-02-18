import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, Building2, GaugeCircle, CheckCircle2, Tags, Dice1, CircleDot, Timer, Crown, Clock, CheckCheck, AlertCircle, ChevronDown } from "lucide-react";
import TopicPill from "./topicPill";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import QuestionFilter from "./questionFilter";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import QuestionList from "./questionList";
import { useDebounceCallback } from "usehooks-ts";
import { Id } from "@/convex/_generated/dataModel";
// Filter Section Component
function QuestionPanel() {
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const questions = useQuery(api.questions.getAll) || [];
    const updateStatusMutation = useMutation(api.questions.updateStatus);
    const updateStarredMutation = useMutation(api.questions.updateStarred);

    // Debounce the update functions with 300ms delay using usehooks-ts
    const updateStatus = useDebounceCallback(
        (args: { questionId: Id<"questions">; status: "complete" | "incomplete" }) => {
            updateStatusMutation(args);
        },
        300 // 300ms delay
    );

    const updateStarred = useDebounceCallback(
        (args: { questionId: Id<"questions">; starred: boolean }) => {
            updateStarredMutation(args);
        },
        300 // 300ms delay
    );

    // Get the arrays from queries
    const { completedQuestions: completedArray = [] } = useQuery(api.userProfiles.getCompletedQuestions) || {};
    const { starredQuestions: starredArray = [] } = useQuery(api.userProfiles.getStarredQuestions) || {};

    // Convert arrays to Sets using useMemo to prevent unnecessary recreations
    const completedQuestionsSet = useMemo(() => new Set(completedArray), [completedArray]);
    const starredQuestionsSet = useMemo(() => new Set(starredArray), [starredArray]);

    // Filter questions based on status and difficulty
    const filteredQuestions = useMemo(() => {
        return questions.filter(question => {
            const isCompleted = completedQuestionsSet.has(question._id);
            const isStarred = starredQuestionsSet.has(question._id);

            // Add completed and starred status to each question
            const enrichedQuestion = {
                ...question,
                status: isCompleted ? "complete" : "incomplete",
                starred: isStarred
            };

            // Filter by difficulty if selected
            if (difficulty) {
                const difficultyMap = { "Easy": 1, "Medium": 2, "Hard": 3 };
                if (enrichedQuestion.difficulty !== difficultyMap[difficulty as keyof typeof difficultyMap]) {
                    return false;
                }
            }

            // Filter by status if selected
            if (status) {
                const questionStatus = isCompleted ? "Complete" : "Incomplete";
                if (status !== questionStatus) {
                    return false;
                }
            }

            return true;
        });
    }, [questions, completedQuestionsSet, starredQuestionsSet, difficulty, status]);

    return (
        <div className="space-y-4">
            {/* Topics Section */}
            <div className="flex flex-wrap gap-2">
                <TopicPill active>All Topics</TopicPill>
                <TopicPill>Algorithms</TopicPill>
                <TopicPill>Database</TopicPill>
                <TopicPill>Shell</TopicPill>
                <TopicPill>Concurrency</TopicPill>
                <TopicPill>JavaScript</TopicPill>
            </div>

            <QuestionFilter
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                status={status}
                setStatus={setStatus}
            />

            {/* Pass the required props to QuestionList */}
            <QuestionList
                questions={filteredQuestions}
                updateStatus={updateStatus}
                updateStarred={updateStarred}
                completedQuestions={completedQuestionsSet}
                starredQuestions={starredQuestionsSet}
            />
        </div>
    );
}

export default QuestionPanel;