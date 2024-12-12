import { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import TurndownService from "turndown";

interface CodeQuestionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  question: Doc<"questions">;
}

export const CodeQuestionPanel: React.FC<CodeQuestionPanelProps> = ({
  question,
  className,
  ...props
}) => {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    br: "  \n",
  });

  let markdownContent = turndownService.turndown(question.question);

  // Post-processing
  markdownContent = markdownContent
    .replace(/\n/g, "\n\n") // Double space between paragraphs
    .replace(/\n\n(\*\*(?:Input|Output|Explanation|Example):?\*\*)/g, "\n\n\n$1") // New line before Input, Output, Explanation, Example
    .replace(/\n{3,}/g, "\n\n"); // Remove excessive newlines

  return (
    <div className={cn("h-full relative bg-background", className)} {...props}>
      <div className="absolute inset-0 overflow-y-auto p-4">
        <h2 className="text-2xl font-bold mb-4">{question.title}</h2>
        <ReactMarkdown>{markdownContent}</ReactMarkdown>
      </div>
    </div>
  );
};
