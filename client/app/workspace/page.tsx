"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
// import {
//   SignedIn,
//   SignedOut,
//   useAuth
// } from '@clerk/nextjs';
import { Sign } from "crypto";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  const questions = useQuery(api.questions.getAll);

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
          {questions.map((question) => (
            <Link
              href={`/workspace/interview/${question.question_id}`}
              key={question.question_id}
              className="block transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              <Card className="h-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 shadow-sm rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl">{question.title}</CardTitle>
                  <Badge
                    className={cn(
                      getDifficultyColor(question.difficulty),
                      "text-white border-transparent dark:text-primary-foreground"
                    )}
                    variant="outline"
                  >
                    {getDifficultyText(question.difficulty)}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2">
                    {question.category.map((element: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
