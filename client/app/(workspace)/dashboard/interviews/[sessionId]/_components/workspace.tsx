import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { useSessionSidebar } from "@/hooks/use-session-sidebar";
import { cn } from "@/lib/utils";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { LucideFileText, PanelLeftOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { CodeEditorPanel } from "./code-editor-panel";
import { CodeQuestionPanel } from "./code-question-panel";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { useAgent } from "@/hooks/use-agent";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  const { collapsed, setCollapsed } = useSessionSidebar();

  const session = useQuery(api.sessions.getById, { sessionId });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });
  const { localParticipant } = useLocalParticipant();

  const { disconnect } = useConnection();
  const { reset } = useEditorStore();

  const connectionState = useConnectionState();
  const { width: windowWidth = 300 } = useWindowSize();
  const { size, isResizing, resizeHandleProps } = useResizePanel({
    defaultSize: 400,
    minSize: 200,
    maxSize: windowWidth - 300,
    direction: "horizontal",
    storageId: "leetmock.workspace.code-question",
  });

  useAgent(sessionId);

  // Setup the participant device
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, connectionState]);

  if (session?.sessionStatus === "completed") {
    disconnect();
    reset();
    toast.success("Congratulations! You've completed the interview. 🎉");
    return redirect("/dashboard/interviews");
  }

  return (
    <div className="bg-background h-screen w-full flex">
      {/* Sidebar */}
      <WorkspaceSidebar sessionId={sessionId} />
      <div className="flex flex-col justify-center items-center flex-1 bg-accent">
        <div className={cn("w-full h-14 flex items-center px-2 relative")}>
          {collapsed && (
            <Tooltip content="Expand">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setCollapsed(false)}
                className={
                  "absolute left-2 transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10"
                }
              >
                <PanelLeftOpen className="w-4 h-4 text-primary" />
              </Button>
            </Tooltip>
          )}
          <div className="flex-1 flex items-center justify-center">
            <Wait data={{ session }}>
              {({ session }) => <WorkspaceToolbar session={session} />}
            </Wait>
          </div>
        </div>
        <div className="w-full h-full flex justify-center items-center p-2 pt-0">
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
                <CodeQuestionPanel
                  className="rounded-md"
                  question={question}
                  style={{ width: size }}
                />
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
                <CodeEditorPanel
                  className="flex-1"
                  sessionId={sessionId}
                  questionId={question._id}
                />
              </>
            )}
          </Wait>
        </div>
      </div>
    </div>
  );
};
