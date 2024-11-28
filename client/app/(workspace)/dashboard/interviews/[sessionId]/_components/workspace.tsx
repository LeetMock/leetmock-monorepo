import { Logo } from "@/components/logo";
import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ConnectionState } from "livekit-client";
import { LucideFileText, PanelLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { CodeEditorPanel } from "./code-editor-panel";
import { CodeQuestionPanel } from "./code-question-panel";
import { TimerCountdown } from "./timer-countdown";
import { WorkspaceToolbar } from "./workspace-toolbar";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
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

  // Setup the participant device
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(false);
      localParticipant.setMicrophoneEnabled(true);
    }
  }, [localParticipant, connectionState]);

  const questionData = useMemo(() => {
    if (!isDefined(question)) return undefined;

    return { title: question.title, content: question.question };
  }, [question]);

  // Add state for sidebar collapse
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (session?.sessionStatus === "completed") {
    disconnect();
    reset();
    toast.success("Congratulations! You've completed the interview. 🎉");
    return redirect("/dashboard/interviews");
  }

  return (
    <div className="bg-background h-screen w-full flex">
      {/* Sidebar */}
      <motion.div
        className="bg-background flex flex-col h-full border-r"
        animate={{ width: isSidebarCollapsed ? "64px" : "224px" }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={cn(
            "w-full flex items-center justify-between pl-4 pr-2 h-14",
            "cursor-pointer group",
            isSidebarCollapsed && "justify-center px-0"
          )}
        >
          <Logo showText={!isSidebarCollapsed} />
          {!isSidebarCollapsed && (
            <Tooltip content="Collapse">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSidebarCollapsed(true)}
                className="transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <PanelLeft className="w-4 h-4 text-primary" />
              </Button>
            </Tooltip>
          )}
        </div>
        <div className="w-full h-full flex flex-col justify-between">
          Side
          <div className={cn("w-full p-2 h-12", isSidebarCollapsed && "px-1")}>
            <TimerCountdown
              timeLeft={1000}
              className="h-full w-full"
              collapsed={isSidebarCollapsed}
            />
          </div>
        </div>
      </motion.div>
      <div className="flex flex-col justify-center items-center flex-1 bg-accent">
        <div className={cn("w-full h-14 flex items-center px-2", "relative group")}>
          {isSidebarCollapsed && (
            <Tooltip content="Expand">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSidebarCollapsed(false)}
                className={cn(
                  "absolute left-2 transition-all duration-200",
                  "opacity-0 group-hover:opacity-100"
                )}
              >
                <PanelLeft className="w-4 h-4 text-primary rotate-180" />
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
            data={{ questionData, question }}
            fallback={
              <div className="flex flex-col space-y-2 items-center justify-center h-full w-full border rounded-md shadow-md bg-background">
                <LucideFileText className="w-10 h-10 text-muted-foreground" />
                <span className="text-muted-foreground">Loading</span>
              </div>
            }
          >
            {({ questionData, question }) => (
              <>
                <CodeEditorPanel
                  sessionId={sessionId}
                  questionId={question._id}
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
                <CodeQuestionPanel className="border rounded-md shrink-0" question={questionData} />
              </>
            )}
          </Wait>
        </div>
      </div>
    </div>
  );
};
