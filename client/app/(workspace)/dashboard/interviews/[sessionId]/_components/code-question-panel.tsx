import { QuestionHolder } from "@/components/QuestionHolder";
import { cn } from "@/lib/utils";
import { LucideFileText } from "lucide-react";

interface CodeQuestionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  question?: {
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
        {!!question ? (
          <QuestionHolder question_title={question.title} question_description={question.content} />
        ) : (
          <div className="flex flex-col space-y-2 items-center justify-center h-full w-full">
            <LucideFileText className="w-10 h-10 text-muted-foreground" />
            <span className="text-muted-foreground">Loading question...</span>
          </div>
        )}
      </div>
    </div>
  );
};
