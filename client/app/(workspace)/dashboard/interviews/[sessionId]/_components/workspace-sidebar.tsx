import { Logo } from "@/components/logo";
import { Timeline } from "@/components/timeline";
import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useSessionSidebar } from "@/hooks/use-session-sidebar";
import {
  cn,
  getTimeDurationSeconds,
  isDefined,
  minutesToMilliseconds,
  minutesToSeconds,
} from "@/lib/utils";
import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Code,
  HelpCircle,
  LucideIcon,
  MessageCircleQuestion,
  MessageSquare,
  PanelLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TimerCountdown } from "./timer-countdown";
import { InterviewStage } from "@/lib/constants";

const STAGE_TO_ICON_MAP: Record<InterviewStage, LucideIcon> = {
  [InterviewStage.Intro]: MessageCircleQuestion,
  [InterviewStage.Background]: MessageSquare,
  [InterviewStage.Coding]: Code,
  [InterviewStage.Evaluation]: HelpCircle,
  [InterviewStage.End]: CheckCircle,
};

const STAGE_TO_TITLE_MAP: Record<InterviewStage, string> = {
  [InterviewStage.Intro]: "Introduction",
  [InterviewStage.Background]: "Background",
  [InterviewStage.Coding]: "Coding",
  [InterviewStage.Evaluation]: "Evaluation",
  [InterviewStage.End]: "End",
};

export const WorkspaceSidebar: React.FC<{
  sessionId: Id<"sessions">;
}> = ({ sessionId }) => {
  const { collapsed, setCollapsed } = useSessionSidebar();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const session = useQuery(api.sessions.getById, { sessionId });
  const codeSessionState = useQuery(api.codeSessionStates.getSessionStateBySessionId, {
    sessionId,
  });

  const activeTaskIdx = codeSessionState?.currentStageIdx ?? 0;
  const timelineSteps: InterviewStage[] | undefined = !isDefined(session)
    ? undefined
    : (session.interviewFlow as InterviewStage[]);

  const isEndStage = isDefined(timelineSteps) && activeTaskIdx === timelineSteps.length;
  const totalTasks = timelineSteps?.length ?? 0;
  const progressPercentage = isDefined(timelineSteps) ? (activeTaskIdx / totalTasks) * 100 : 0;
  const totalTime = !isDefined(session)
    ? minutesToSeconds(60)
    : minutesToSeconds(session.timeLimit);

  useEffect(() => {
    if (!isDefined(session)) return;
    if (!isDefined(session.sessionStartTime)) {
      setTimeLeft(minutesToSeconds(session.timeLimit));
      return;
    }

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const endTime = session.sessionStartTime! + minutesToMilliseconds(session.timeLimit);
      const timeLeft = getTimeDurationSeconds(currentTime, endTime);
      setTimeLeft(Math.max(timeLeft, 0));
    }, 500);

    return () => clearInterval(interval);
  }, [session, timeLeft]);

  return (
    <motion.div
      className="bg-background flex flex-col h-full border-r"
      animate={{ width: collapsed ? "4rem" : "240px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={cn(
          "w-full flex items-center justify-between pl-4 pr-2 h-14 border-b",
          "cursor-pointer group",
          collapsed && "justify-center px-0"
        )}
        animate={{ paddingLeft: collapsed ? "0" : "1rem" }}
        transition={{ duration: 0.2 }}
      >
        <Logo showText={!collapsed} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Tooltip content="Collapse">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setCollapsed(true)}
                  className="transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <PanelLeft className="w-4 h-4 text-primary" />
                </Button>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Sidebar Content */}
      <div className="w-full h-full flex flex-col justify-between">
        <div className="space-y-6 pt-4">
          <AnimatePresence mode="wait">
            {collapsed ? (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-2 py-4 space-y-4"
              >
                {/* Vertical Progress Bar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-24 w-1.5 bg-muted rounded-full">
                    <div
                      className="absolute bottom-0 w-1.5 bg-primary rounded-full transition-all duration-300"
                      style={{ height: `${Math.round((activeTaskIdx / totalTasks) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground rotate-0">
                    {`${Math.round((activeTaskIdx / totalTasks) * 100)}%`}
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="px-4 space-y-4"
              >
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Software Engineer</h2>
                  <p className="text-sm text-muted-foreground">Technical Interview</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">Progress</span>
                    <span className="text-foreground font-semibold">{`${Math.round((activeTaskIdx / totalTasks) * 100)}%`}</span>
                  </div>
                  <div className="space-y-1.5">
                    <Progress
                      value={progressPercentage}
                      className="h-1.5 transition-all duration-300"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{`${activeTaskIdx}/${totalTasks} Complete`}</span>
                      <span>{`${totalTasks - activeTaskIdx} remaining`}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Interview timeline */}
          {timelineSteps && (
            <motion.div
              className={cn("mx-4", collapsed && "mx-2")}
              animate={{ marginLeft: collapsed ? "0.5rem" : "1rem" }}
              transition={{ duration: 0.2 }}
            >
              <Timeline.Root>
                {timelineSteps.map((step, index) => (
                  <TimelineItem
                    key={step}
                    step={step}
                    completed={index < activeTaskIdx}
                    isActive={index === activeTaskIdx}
                    isLastItem={false}
                    collapsed={collapsed}
                  />
                ))}
                <TimelineItem
                  key={InterviewStage.End}
                  step={InterviewStage.End}
                  completed={isEndStage}
                  isActive={isEndStage}
                  isLastItem={true}
                  collapsed={collapsed}
                />
              </Timeline.Root>
            </motion.div>
          )}
        </div>
        {/* Timer */}
        <div className="w-full p-2 border-t">
          <TimerCountdown timeLeft={timeLeft} collapsed={collapsed} totalTime={totalTime} />
        </div>
      </div>
    </motion.div>
  );
};

const TimelineItem: React.FC<{
  step: InterviewStage;
  completed: boolean;
  isActive: boolean;
  isLastItem: boolean;
  collapsed: boolean;
}> = ({ step, completed, isActive, isLastItem, collapsed }) => {
  const collapsedView = useMemo(() => {
    return (
      <div className="absolute -top-1 left-7 z-10 hidden group-hover:block min-w-60">
        <div className="flex flex-col gap-2 ml-2.5 px-2 py-1.5 bg-background rounded-md border shadow-sm">
          <Timeline.Title>{STAGE_TO_TITLE_MAP[step]}</Timeline.Title>
          {completed && (
            <div className="flex flex-col gap-2 pb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Completed in 22 minutes</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }, [step, completed]);

  const expandedView = useMemo(() => {
    return (
      <Timeline.Content className="space-y-2 pb-4">
        <Timeline.Title>{STAGE_TO_TITLE_MAP[step]}</Timeline.Title>
        <div className="flex flex-col gap-2">
          {completed && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Completed in 22 minutes</span>
            </div>
          )}
        </div>
      </Timeline.Content>
    );
  }, [step, completed]);

  return (
    <Timeline.Item
      className={cn(
        "transition-all duration-200",
        collapsed && "self-center relative group",
        !isActive && !completed && "opacity-50"
      )}
    >
      <Timeline.Connector
        icon={STAGE_TO_ICON_MAP[step]}
        isLastItem={isLastItem}
        completed={completed}
        className="cursor-pointer"
      />
      {collapsed ? collapsedView : expandedView}
    </Timeline.Item>
  );
};
