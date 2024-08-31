"use client";

import { useCallback, useEffect } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import router from "next/router";
import { toast } from "sonner";
import { useEditorState } from "@/hooks/useEditorState";

const getDifficultyColor = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return "bg-green-500";
    case 2:
      return "bg-yellow-400";
    case 3:
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getDifficultyText = (difficulty: number) => {
  switch (difficulty) {
    case 1:
      return "Easy";
    case 2:
      return "Medium";
    case 3:
      return "Hard";
    default:
      return "Unknown";
  }
};

export default function InterviewSelectionPage() {
  const router = useRouter();

  const questions = useQuery(api.questions.getAll);
  const createAgentThread = useAction(api.actions.createAgentThread);
  const createSession = useMutation(api.sessions.create);

  const onQuestionSelected = useCallback(
    async (questionId: Id<"questions">) => {
      if (!questions) return; // Check if questions is undefined
      const question = questions.find(q => q._id === questionId);
      if (!question) return;

      const { functionName, inputParameters } = question; // Assuming these fields exist in your question object

      // TODO: wrap inside an action
      const promise = createAgentThread({ graphId: "code-mock-v1" })
        .then(({ threadId, assistantId }) => {
          return createSession({
            questionId: questionId,
            agentThreadId: threadId,
            assistantId: assistantId,
            functionName: functionName,
            inputParameters: inputParameters
          });
        })
        .then((sessionId) => {
          router.push(`/interview/${sessionId}`);
        });

      toast.promise(promise, {
        loading: "Creating interview",
        success: "Interview created",
        error: "Error creating interview",
      });
    },
    [createAgentThread, createSession, router, questions]
  );

  if (questions === undefined) {
    return <div className="p-4">Loading...</div>;
  }

  if (questions === null) {
    return <div className="p-4">Error loading questions. Please try again later.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <p className="text-xl font-semibold leading-0">Questions</p>
      <p className="text-md text-muted-foreground leading-0 mb-6">
        Select a question to start your interview preparation.
      </p>
      {questions.length === 0 ? (
        <p className="text-center">No questions available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map(({ _id, title, difficulty, category }) => (
            <Card
              key={_id}
              className={cn(
                "h-full cursor-pointer hover:bg-gray-50 dark:bg-secondary shadow-sm rounded-lg",
                "block transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
              )}
              onClick={() => onQuestionSelected(_id)}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">{title}</CardTitle>
                <Badge
                  className={cn(
                    getDifficultyColor(difficulty),
                    "text-white border-transparent dark:text-primary-foreground"
                  )}
                  variant="outline"
                >
                  {getDifficultyText(difficulty)}
                </Badge>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2">
                  {category.map((element: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {element}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
