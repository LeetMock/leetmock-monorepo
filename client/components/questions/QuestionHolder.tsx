import React from "react";

interface QuestionHolderProps {
  question_title: string;
  question_description: string;
}

export const QuestionHolder: React.FC<QuestionHolderProps> = ({
  question_title,
  question_description,
}) => {
  return (
    <div className="space-y-6 p-4 min-w-[30rem]">
      <h1 className="text-3xl font-bold">{question_title}</h1>
      <div className="space-y-4">
        <div>
          <strong>Description:</strong>
          <p className="whitespace-pre-wrap">{question_description}</p>
        </div>
      </div>
    </div>
  );
};
