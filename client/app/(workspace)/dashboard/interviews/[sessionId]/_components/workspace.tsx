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
import { LucideFileText, PanelLeft, PanelLeftOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { CodeEditorPanel } from "./code-editor-panel";
import { CodeQuestionPanel } from "./code-question-panel";
import { TimerCountdown } from "./timer-countdown";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { Timeline } from "@/components/timeline";
import { CircleIcon, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

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

  const timelineSteps = [
    { title: "Introduction", icon: CheckCircle2, completed: true },
    { title: "Coding Challenge", icon: Circle, completed: false },
    { title: "Q & A", icon: Circle, completed: false },
  ];

  const completedTasks = timelineSteps.filter((step) => step.completed).length;
  const totalTasks = timelineSteps.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

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
        animate={{ width: isSidebarCollapsed ? "4.5rem" : "240px" }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={cn(
            "w-full flex items-center justify-between pl-4 pr-2 h-14 border-b",
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
          <div className="space-y-6 pt-4">
            {/* Interview details and Progress Indicator */}
            {isSidebarCollapsed ? (
              <div className="px-2 py-4 space-y-4">
                {/* Vertical Progress Bar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-24 w-1.5 bg-muted rounded-full">
                    <div
                      className="absolute bottom-0 w-1.5 bg-primary rounded-full transition-all duration-300"
                      style={{ height: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground rotate-0">
                    {`${Math.round((completedTasks / totalTasks) * 100)}%`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-4 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Software Engineer</h2>
                  <p className="text-sm text-muted-foreground">Technical Interview</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="text-foreground font-semibold">{`${Math.round((completedTasks / totalTasks) * 100)}%`}</span>
                  </div>
                  <div className="space-y-1.5">
                    <Progress
                      value={progressPercentage}
                      className="h-1.5 transition-all duration-300"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{`${completedTasks}/${totalTasks} Complete`}</span>
                      <span>{`${totalTasks - completedTasks} remaining`}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Interview timeline */}
            <div className={cn("mx-4", isSidebarCollapsed && "mx-2")}>
              <Timeline.Root>
                {timelineSteps.map((step, index) => (
                  <Timeline.Item
                    key={index}
                    className={cn(
                      "transition-all duration-200",
                      isSidebarCollapsed && "self-center relative group"
                    )}
                  >
                    <Timeline.Connector
                      icon={step.icon}
                      isLastItem={index === timelineSteps.length - 1}
                      completed={step.completed}
                    />
                    {!isSidebarCollapsed && (
                      <Timeline.Content className="space-y-2">
                        <Timeline.Title>{step.title}</Timeline.Title>
                        <div className="flex flex-col gap-2"></div>
                      </Timeline.Content>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline.Root>
            </div>
          </div>
          <div className={cn("w-full p-2 border-t")}>
            <TimerCountdown timeLeft={1000} collapsed={isSidebarCollapsed} />
          </div>
        </div>
      </motion.div>
      <div className="flex flex-col justify-center items-center flex-1 bg-accent">
        <div className={cn("w-full h-14 flex items-center px-2 relative")}>
          {isSidebarCollapsed && (
            <Tooltip content="Expand">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSidebarCollapsed(false)}
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
                <CodeQuestionPanel
                  className="rounded-md"
                  question={questionData}
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
