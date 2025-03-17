"use client";

import { Id } from "@/convex/_generated/dataModel";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Tag {
    name: string;
    count: number;
}

interface Company {
    name: string;
    count: number;
}

interface Question {
    _id: Id<"questions">;
    title: string;
    question: string;
    difficulty: number;
    companies: string[];
    category: string[];
    functionName: string;
    solutions: Record<string, string>;
    inputParameters: Record<string, Record<string, string>>;
    outputParameters: string;
    evalMode: "exactMatch" | "listNodeIter" | "sortedMatch";
    tests: Array<{
        input: any;
        output: any;
    }>;
    metaData: Record<string, any>;
    status?: "complete" | "incomplete";
    starred?: boolean;
}

interface QuestionState {
    // Filter states
    difficulty: string | null;
    status: string | null;
    searchQuery: string;
    selectedTab: string;
    selectedTags: string[];
    selectedCompanies: string[];

    // Cached data
    questions: Question[];
    completedQuestions: Set<Id<"questions">>;
    starredQuestions: Set<Id<"questions">>;
    tags: Tag[];
    companies: Company[];
    filteredQuestions: Question[];

    // Actions for filter states
    setDifficulty: (difficulty: string | null) => void;
    setStatus: (status: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSelectedTab: (tab: string) => void;
    setSelectedTags: (tags: string[]) => void;
    setSelectedCompanies: (companies: string[]) => void;

    // Actions for cached data
    setQuestions: (questions: Question[]) => void;
    setCompletedQuestions: (questionIds: Id<"questions">[]) => void;
    setStarredQuestions: (questionIds: Id<"questions">[]) => void;
    updateFilteredQuestions: () => void;
    reset: () => void;

    // Add these functions
    updateStatus: (questionId: Id<"questions">, completed: boolean) => void;
    updateStarred: (questionId: Id<"questions">, starred: boolean) => void;
}

export const useQuestionStore = create<QuestionState>()(
    persist(
        (set, get) => ({
            // Initial filter states
            difficulty: null,
            status: null,
            searchQuery: "",
            selectedTab: "general",
            selectedTags: [],
            selectedCompanies: [],

            // Initial cached data
            questions: [],
            completedQuestions: new Set(),
            starredQuestions: new Set(),
            tags: [],
            companies: [],
            filteredQuestions: [],

            // Filter state actions
            setDifficulty: (difficulty) => {
                set({ difficulty });
                get().updateFilteredQuestions();
            },
            setStatus: (status) => {
                set({ status });
                get().updateFilteredQuestions();
            },
            setSearchQuery: (searchQuery) => {
                set({ searchQuery });
                get().updateFilteredQuestions();
            },
            setSelectedTab: (selectedTab) => {
                set({ selectedTab });
                get().updateFilteredQuestions();
            },
            setSelectedTags: (selectedTags) => {
                set({ selectedTags });
                get().updateFilteredQuestions();
            },
            setSelectedCompanies: (selectedCompanies) => {
                set({ selectedCompanies });
                get().updateFilteredQuestions();
            },

            // Cached data actions
            setQuestions: (questions) => {
                const state = get();

                // Calculate tags from category field
                const tagCount = new Map<string, number>();
                const companyCount = new Map<string, number>();

                questions.forEach(question => {
                    question.category.forEach(tag => {
                        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
                    });

                    question.companies.forEach(company => {
                        companyCount.set(company, (companyCount.get(company) || 0) + 1);
                    });
                });

                const tags = Array.from(tagCount.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                const companies = Array.from(companyCount.entries())
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count);

                set({
                    questions,
                    tags,
                    companies
                });

                state.updateFilteredQuestions();
            },

            setCompletedQuestions: (questionIds) => {
                set({ completedQuestions: new Set(questionIds) });
                get().updateFilteredQuestions();
            },

            setStarredQuestions: (questionIds) => {
                set({ starredQuestions: new Set(questionIds) });
                get().updateFilteredQuestions();
            },

            updateFilteredQuestions: () => {
                const state = get();
                const filteredQuestions = state.questions.filter(question => {
                    const isCompleted = state.completedQuestions.has(question._id);
                    const isStarred = state.starredQuestions.has(question._id);

                    // Filter by tab selection
                    if (state.selectedTab === "starred" && !isStarred) {
                        return false;
                    }

                    // Filter by search query
                    if (state.searchQuery) {
                        const searchLower = state.searchQuery.toLowerCase();
                        if (!question.title.toLowerCase().includes(searchLower)) {
                            return false;
                        }
                    }

                    // Filter by difficulty if selected
                    if (state.difficulty) {
                        const difficultyMap = { "Easy": 1, "Medium": 2, "Hard": 3 };
                        if (question.difficulty !== difficultyMap[state.difficulty as keyof typeof difficultyMap]) {
                            return false;
                        }
                    }

                    // Filter by status if selected
                    if (state.status) {
                        const questionStatus = isCompleted ? "Complete" : "Incomplete";
                        if (state.status !== questionStatus) {
                            return false;
                        }
                    }

                    // Filter by selected tags (using category field)
                    if (state.selectedTags.length > 0) {
                        const hasMatchingTag = question.category.some(tag =>
                            state.selectedTags.includes(tag)
                        );
                        if (!hasMatchingTag) return false;
                    }

                    // Filter by selected companies
                    if (state.selectedCompanies.length > 0) {
                        const hasMatchingCompany = question.companies.some(company =>
                            state.selectedCompanies.includes(company)
                        );
                        if (!hasMatchingCompany) return false;
                    }

                    return true;
                });

                set({ filteredQuestions });
            },

            reset: () => set({
                difficulty: null,
                status: null,
                searchQuery: "",
                selectedTab: "general",
                selectedTags: [],
                selectedCompanies: [],
                questions: [],
                completedQuestions: new Set(),
                starredQuestions: new Set(),
                tags: [],
                companies: [],
                filteredQuestions: [],
            }),

            // Add these implementations
            updateStatus: (questionId, completed) => {
                const state = get();
                const newCompletedQuestions = new Set(state.completedQuestions);

                if (completed) {
                    newCompletedQuestions.add(questionId);
                } else {
                    newCompletedQuestions.delete(questionId);
                }

                // Update the state in a single operation
                set({
                    completedQuestions: newCompletedQuestions
                });

                // Only update filtered questions if they might be affected
                if (state.status || state.selectedTab === "starred") {
                    state.updateFilteredQuestions();
                }
            },

            updateStarred: (questionId, starred) => {
                const state = get();
                const newStarredQuestions = new Set(state.starredQuestions);

                if (starred) {
                    newStarredQuestions.add(questionId);
                } else {
                    newStarredQuestions.delete(questionId);
                }

                // Update the state in a single operation
                set({
                    starredQuestions: newStarredQuestions
                });

                // Only update filtered questions if they might be affected
                if (state.selectedTab === "starred") {
                    state.updateFilteredQuestions();
                }
            },
        }),
        {
            name: "question-store",
            partialize: (state) => ({
                // Only persist filter states, not the cached data
                difficulty: state.difficulty,
                status: state.status,
                searchQuery: state.searchQuery,
                selectedTab: state.selectedTab,
                selectedTags: state.selectedTags,
                selectedCompanies: state.selectedCompanies,
            }),
        }
    )
);