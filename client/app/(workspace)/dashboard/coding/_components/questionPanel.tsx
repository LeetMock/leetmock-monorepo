"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuestionStore } from "@/hooks/use-question-store";
import { useMutation, useQuery } from "convex/react";
import { BookOpen, History, Star } from "lucide-react";
import { useEffect } from "react";
import { useDebounceCallback } from "usehooks-ts";
import QuestionFilter from "./questionFilter";
import QuestionList from "./questionList";

// Filter Section Component
function QuestionPanel() {
  const {
    difficulty,
    status,
    searchQuery,
    selectedTab,
    selectedTags,
    selectedCompanies,
    filteredQuestions,
    tags,
    companies,
    completedQuestions,
    starredQuestions,
    setDifficulty,
    setStatus,
    setSearchQuery,
    setSelectedTab,
    setSelectedTags,
    setSelectedCompanies,
    setQuestions,
    setCompletedQuestions,
    setStarredQuestions,
    updateStatus: updateLocalStatus,
    updateStarred: updateLocalStarred,
  } = useQuestionStore();

  const questionsQuery = useQuery(api.questions.getAll);
  const completedQuery = useQuery(api.userProfiles.getCompletedQuestions);
  const starredQuery = useQuery(api.userProfiles.getStarredQuestions);

  // Update store when queries change
  useEffect(() => {
    if (questionsQuery) {
      setQuestions(questionsQuery);
    }
  }, [questionsQuery, setQuestions]);

  useEffect(() => {
    if (completedQuery?.completedQuestions) {
      setCompletedQuestions(completedQuery.completedQuestions);
    }
  }, [completedQuery, setCompletedQuestions]);

  useEffect(() => {
    if (starredQuery?.starredQuestions) {
      setStarredQuestions(starredQuery.starredQuestions);
    }
  }, [starredQuery, setStarredQuestions]);

  const updateStatusMutation = useMutation(api.questions.updateStatus);
  const updateStarredMutation = useMutation(api.questions.updateStarred);

  const updateStatus = useDebounceCallback(
    async (args: { questionId: Id<"questions">; status: "complete" | "incomplete" }) => {
      // Optimistic update - update local state immediately
      updateLocalStatus(args.questionId, args.status === "complete");

      try {
        // Then update the server
        await updateStatusMutation(args);
      } catch (error) {
        // If server update fails, revert the optimistic update
        updateLocalStatus(args.questionId, args.status !== "complete");
        console.error("Failed to update question status:", error);
      }
    },
    300
  );

  const updateStarred = useDebounceCallback(
    async (args: { questionId: Id<"questions">; starred: boolean }) => {
      // Optimistic update - update local state immediately
      updateLocalStarred(args.questionId, args.starred);

      try {
        // Then update the server
        await updateStarredMutation(args);
      } catch (error) {
        // If server update fails, revert the optimistic update
        updateLocalStarred(args.questionId, !args.starred);
        console.error("Failed to update starred status:", error);
      }
    },
    300
  );

  return (
    <div className="space-y-4">
      {/* Question Collections Section */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="lg"
          className={`rounded-full ${
            selectedTab === "general"
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
          className={`rounded-full ${
            selectedTab === "starred"
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
          className={`rounded-full ${
            selectedTab === "past"
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
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        tags={tags}
        companies={companies}
      />

      {/* Pass the required props to QuestionList */}
      <QuestionList
        questions={filteredQuestions}
        updateStatus={updateStatus}
        updateStarred={updateStarred}
        completedQuestions={completedQuestions}
        starredQuestions={starredQuestions}
      />
    </div>
  );
}

export default QuestionPanel;
