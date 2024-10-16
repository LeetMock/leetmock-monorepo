import { QuestionHolder } from "@/components/QuestionHolder";
import { cn } from "@/lib/utils";

interface CodeQuestionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  question: {
    title: string;
    content: string;
  };
}

export const CodeQuestionPanel: React.FC<CodeQuestionPanelProps> = ({
  question,
  className,
  ...props
}) => {
  return (
    <div className={cn("h-full relative bg-background", className)} {...props}>
      <div className="absolute inset-0 overflow-y-auto">
        <QuestionHolder question_title={question.title} question_description={question.content} />
      </div>
    </div>
  );
};
