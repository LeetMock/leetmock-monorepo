"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

const getDifficultyColor = (difficulty: number) => {
  const colors = {
    1: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    2: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    3: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  };
  return colors[difficulty] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

const getDifficultyText = (difficulty: number) => {
  const labels = {
    1: "Easy",
    2: "Medium",
    3: "Hard"
  };
  return labels[difficulty] || "Unknown";
};

export const QuestionCard: React.FC<{
  _id: Id<"questions">;
  title: string;
  difficulty: number;
  category: string[];
  onQuestionSelected: (id: Id<"questions">) => void;
  isSelected: boolean;
}> = ({ _id, title, difficulty, category, onQuestionSelected, isSelected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const displayCategories = isExpanded ? category : category.slice(0, 2);
  const remainingCategories = category.length - 2;

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onQuestionSelected
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      key={_id}
      className={cn(
        "flex-1 cursor-pointer hover:bg-gray-50 dark:bg-secondary shadow-sm rounded-lg",
        "block transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg",
        isSelected && "ring-2 ring-blue-500 shadow-lg scale-105"
      )}
      onClick={() => onQuestionSelected(_id)}
    >
      <CardHeader className="flex flex-row items-start justify-between p-2">
        <CardTitle className="font-medium text-xs mb-0 line-clamp-2 mr-2 flex-grow">{title}</CardTitle>
        <Badge
          className={cn(
            getDifficultyColor(difficulty),
            "text-[10px] px-1.5 py-0.5 min-w-[40px] text-center flex-shrink-0 font-medium rounded-full",
            "pointer-events-none"
          )}
        >
          {getDifficultyText(difficulty)}
        </Badge>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div
          className="flex flex-wrap gap-1 cursor-pointer"
          onClick={handleCategoryClick}
        >
          {displayCategories.map((element: string, index: number) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              {element}
            </Badge>
          ))}
          {!isExpanded && remainingCategories > 0 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200"
            >
              +{remainingCategories} more
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
