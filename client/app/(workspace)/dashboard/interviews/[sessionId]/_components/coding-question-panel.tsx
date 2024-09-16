import { QuestionHolder } from "@/components/QuestionHolder";
import { cn } from "@/lib/utils";

interface CodingQuestionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  question?: {
    title: string;
    content: string;
  };
}

export const CodingQuestionPanel: React.FC<CodingQuestionPanelProps> = ({
  question,
  className,
  ...props
}) => {
  return (
    <div className={cn("h-full w-full relative bg-background", className)} {...props}>
      <div className="absolute inset-0 overflow-y-auto">
        {question ? (
          <QuestionHolder question_title={question.title} question_description={question.content} />
        ) : (
          <div>Loading question...</div>
        )}
      </div>
    </div>
  );
};
