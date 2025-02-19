import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Star, History, Building2, GaugeCircle, CheckCircle2, Tags, Dice1, CircleDot, Timer, Crown, Clock, CheckCheck, AlertCircle, ChevronDown } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTab, setSelectedTab] = useState("general");

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

            // Filter by tab selection
            if (selectedTab === "starred" && !isStarred) {
                return false;
            }

            // Filter by search query
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                if (!question.title.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

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
    }, [questions, completedQuestionsSet, starredQuestionsSet, difficulty, status, searchQuery, selectedTab]);

    // Calculate tags and companies from questions
    const { tags, companies } = useMemo(() => {
        const tagCount = new Map<string, number>();
        const companyCount = new Map<string, number>();

        questions.forEach(question => {
            // Count tags
            question.category.forEach(tag => {
                tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
            });

            // Count companies
            question.companies.forEach(company => {
                companyCount.set(company, (companyCount.get(company) || 0) + 1);
            });
        });

        // Convert to sorted arrays of objects
        const tags = Array.from(tagCount.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        const companies = Array.from(companyCount.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return { tags, companies };
    }, [questions]);

    return (
        <div className="space-y-4">
            {/* Question Collections Section */}
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="lg"
                    className={`rounded-full ${selectedTab === "general"
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-blue-50 hover:text-blue-600"
                        }`}
                    onClick={() => setSelectedTab("general")}
                >
                    <BookOpen className="h-4 w-4 mr-2" />
                    General Practice
                </Button>

                <div className="h-6 w-[1px] bg-gray-200 mx-3" />

                <Button
                    variant="ghost"
                    size="lg"
                    className={`rounded-full ${selectedTab === "starred"
                        ? "bg-yellow-50 text-yellow-600"
                        : "hover:bg-yellow-50 hover:text-yellow-600"
                        }`}
                    onClick={() => setSelectedTab("starred")}
                >
                    <Star className="h-4 w-4 mr-2" />
                    My Starred
                </Button>

                <div className="h-6 w-[1px] bg-gray-200 mx-3" />

                <Button
                    variant="ghost"
                    size="lg"
                    className={`rounded-full ${selectedTab === "past"
                        ? "bg-green-50 text-green-600"
                        : "hover:bg-green-50 hover:text-green-600"
                        }`}
                    onClick={() => setSelectedTab("past")}
                >
                    <History className="h-4 w-4 mr-2" />
                    Past Practice
                </Button>
            </div>

            <QuestionFilter
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                status={status}
                setStatus={setStatus}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                tags={tags}
                companies={companies}
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