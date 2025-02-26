"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Filters } from "../utils/types";

interface QuestionFiltersProps {
    filters: Filters;
    setFilters: React.Dispatch<React.SetStateAction<Filters>>;
    categories: string[];
    totalQuestions: number;
    filteredCount: number;
}

export default function QuestionFilters({
    filters,
    setFilters,
    categories,
    totalQuestions,
    filteredCount
}: QuestionFiltersProps) {
    return (
        <div className="p-4 border-b space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-9"
                    />
                </div>

                <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.difficulty}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="text-sm text-muted-foreground">
                Showing {filteredCount} of {totalQuestions} questions
            </div>
        </div>
    );
} 