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
  MessageSquare,
  PanelLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TimerCountdown } from "./timer-countdown";
import { InterviewStage } from "@/lib/constants";

type TimelineStep = {
  id: InterviewStage | undefined;
  title: string;
  icon: LucideIcon;
  completedInMinutes: number | undefined;
};

const timelineSteps: TimelineStep[] = [
  {
    id: InterviewStage.Background,
    title: "Background Discussion",
    icon: MessageSquare,
    completedInMinutes: 2,
  },
  {
    id: InterviewStage.Coding,
    title: "Coding Challenge",
    icon: Code,
    completedInMinutes: 24,
  },
  {
    id: InterviewStage.Evaluation,
    title: "Q & A",
    icon: HelpCircle,
    completedInMinutes: 3,
  },
];

const endStep = {
  id: InterviewStage.End,
  title: "",
  icon: CheckCircle,
  completedInMinutes: undefined,
};

export const WorkspaceSidebar: React.FC<{
  sessionId: Id<"sessions">;
}> = ({ sessionId }) => {
  const { collapsed, setCollapsed } = useSessionSidebar();

  const session = useQuery(api.sessions.getById, { sessionId });
  const codeSessionState = useQuery(api.codeSessionStates.getSessionStateBySessionId, {
    sessionId,
  });

  const activeTaskIdx = useMemo(() => {
    let taskIdx = 0;

    if (isDefined(codeSessionState)) {
      const sessionStage = codeSessionState.stage;

      timelineSteps.forEach((step, idx) => {
        if (step.id === sessionStage) {
          taskIdx = idx;
        }
      });

      if (sessionStage === InterviewStage.End) {
        taskIdx = timelineSteps.length;
      }
    }

    return taskIdx;
  }, [codeSessionState]);

  const isEndStage = activeTaskIdx === timelineSteps.length;

  const totalTasks = timelineSteps.length;
  const progressPercentage = (activeTaskIdx / totalTasks) * 100;

  const [timeLeft, setTimeLeft] = useState<number>(0);

  const totalTime = useMemo(() => {
    if (!isDefined(session)) return minutesToSeconds(60);
    return minutesToSeconds(session.timeLimit);
  }, [session]);

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
          <motion.div
            className={cn("mx-4", collapsed && "mx-2")}
            animate={{ marginLeft: collapsed ? "0.5rem" : "1rem" }}
            transition={{ duration: 0.2 }}
          >
            <Timeline.Root>
              {timelineSteps.map((step, index) => (
                <TimelineItem
                  key={step.title}
                  step={step}
                  completed={index < activeTaskIdx}
                  isActive={index === activeTaskIdx}
                  isLastItem={false}
                  collapsed={collapsed}
                />
              ))}
              <TimelineItem
                key={endStep.title}
                step={endStep}
                completed={isEndStage}
                isActive={isEndStage}
                isLastItem={true}
                collapsed={collapsed}
              />
            </Timeline.Root>
          </motion.div>
        </div>

        <div className="w-full p-2 border-t">
          <TimerCountdown timeLeft={timeLeft} collapsed={collapsed} totalTime={totalTime} />
        </div>
      </div>
    </motion.div>
  );
};

const TimelineItem: React.FC<{
  step: TimelineStep;
  completed: boolean;
  isActive: boolean;
  isLastItem: boolean;
  collapsed: boolean;
}> = ({ step, completed, isActive, isLastItem, collapsed }) => {
  const collapsedView = useMemo(() => {
    return (
      <div className="absolute -top-1 left-7 z-10 hidden group-hover:block min-w-60">
        <div className="flex flex-col gap-2 ml-2.5 px-2 py-1.5 bg-background rounded-md border shadow-sm">
          <Timeline.Title>{step.title}</Timeline.Title>
          {completed && step.completedInMinutes && (
            <div className="flex flex-col gap-2 pb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Completed in {step.completedInMinutes} minutes</span>
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
        <Timeline.Title>{step.title}</Timeline.Title>
        <div className="flex flex-col gap-2">
          {completed && step.completedInMinutes && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Completed in {step.completedInMinutes} minutes</span>
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
        icon={step.icon}
        isLastItem={isLastItem}
        completed={completed}
        className="cursor-pointer"
      />
      {collapsed ? collapsedView : expandedView}
    </Timeline.Item>
  );
};
