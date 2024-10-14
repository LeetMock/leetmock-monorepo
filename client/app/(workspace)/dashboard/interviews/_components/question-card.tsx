"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";
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

export const QuestionCard: React.FC<{
  _id: Id<"questions">;
  title: string;
  difficulty: number;
  category: string[];
  onQuestionSelected: (id: Id<"questions">) => void;
}> = ({ _id, title, difficulty, category, onQuestionSelected }) => {
  return (
    <Card
      key={_id}
      className={cn(
        "flex-1 cursor-pointer hover:bg-gray-50 dark:bg-secondary shadow-sm rounded-lg",
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
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {category.map((element: string, index: number) => (
            <Badge key={index} variant="secondary">
              {element}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
