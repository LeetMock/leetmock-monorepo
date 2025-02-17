import { useState } from "react";
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
import { useQuery } from "convex/react";
import QuestionList from "./questionList";

// Filter Section Component
function QuestionPanel() {
    const [difficulty, setDifficulty] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const questions = useQuery(api.questions.getAll) || [];

    // const categories = useMemo(() => {
    //     if (!questions) return [];
    //     const categorySet = new Set<string>();
    //     questions.forEach(question => {
    //         question.category?.forEach(cat => categorySet.add(cat));
    //     });
    //     return Array.from(categorySet);
    // }, [questions]);

    // const filteredQuestions = useMemo(() => {
    //     if (!questions) return [];

    //     return questions.filter(question => {
    //         const matchesSearch = question.title.toLowerCase().includes(filters.search.toLowerCase());

    //         const matchesCategory = filters.category === "all" ||
    //             question.category?.includes(filters.category);

    //         const matchesDifficulty = filters.difficulty === "all" ||
    //             question.difficulty === Number(filters.difficulty);

    //         return matchesSearch && matchesCategory && matchesDifficulty;
    //     });
    // }, [questions, filters]);

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

            {/* Question List */}
            <QuestionList />
        </div>
    );
}

export default QuestionPanel;