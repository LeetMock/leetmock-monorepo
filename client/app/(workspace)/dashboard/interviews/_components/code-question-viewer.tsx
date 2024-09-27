import { Id } from "@/convex/_generated/dataModel";
import { QuestionCard } from "./question-card";

interface Question {
  _id: Id<"questions">;
  title: string;
  difficulty: number;
  category: string[];
}

export const CodeQuestionViewer: React.FC<{
  questions: Question[];
  onQuestionSelected: (id: Id<"questions">) => void;
}> = ({ questions, onQuestionSelected }) => {
  return (
    <div className="h-full flex-grow">
      {questions.length === 0 ? (
        <p className="text-center">No questions available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map(({ _id, title, difficulty, category }) => (
            <QuestionCard
              key={_id}
              _id={_id}
              title={title}
              difficulty={difficulty}
              category={category}
              onQuestionSelected={onQuestionSelected}
            />
          ))}
        </div>
      )}
    </div>
  );
};
