import { Wait } from "@/components/wait";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { LucideFileText } from "lucide-react";
import { CodeEditorPanel } from "./code-editor-panel";
import { CodeQuestionPanel } from "./code-question-panel";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { useWindowSize } from "usehooks-ts";

export const CodeView: React.FC<{
  sessionId: Id<"sessions">;
  question?: Doc<"questions">;
}> = ({ sessionId, question }) => {
  const { width: windowWidth = 300 } = useWindowSize();
  const { size, isResizing, resizeHandleProps } = useResizePanel({
    defaultSize: 400,
    minSize: 200,
    maxSize: windowWidth - 300,
    direction: "horizontal",
    storageId: "leetmock.workspace.code-question",
  });

  return (
    <Wait
      data={{ question }}
      fallback={
        <div className="flex flex-col space-y-2 items-center justify-center h-full w-full border rounded-md shadow-md bg-background">
          <LucideFileText className="w-10 h-10 text-muted-foreground" />
          <span className="text-muted-foreground">Loading</span>
        </div>
      }
    >
      {({ question }) => (
        <>
          <CodeQuestionPanel className="rounded-md" question={question} style={{ width: size }} />
          <div
            className={cn(
              "w-px h-full cursor-ew-resize px-1 transition-all hover:bg-muted-foreground/10 flex-0 rounded-full relative",
              isResizing ? "bg-muted-foreground/10" : "bg-transparent"
            )}
            {...resizeHandleProps}
          >
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="h-9 w-[3px] rounded-full bg-muted-foreground/50"></div>
            </div>
          </div>
          <CodeEditorPanel className="flex-1" sessionId={sessionId} questionId={question._id} />
        </>
      )}
    </Wait>
  );
};
