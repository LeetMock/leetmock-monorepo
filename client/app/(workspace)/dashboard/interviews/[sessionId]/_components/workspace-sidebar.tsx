import { Logo } from "@/components/logo";
import { Timeline } from "@/components/timeline";
import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  cn,
  getTimeDurationSeconds,
  isDefined,
  minutesToMilliseconds,
  minutesToSeconds,
} from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Code, HelpCircle, LucideIcon, MessageSquare, PanelLeft } from "lucide-react";
import { TimerCountdown } from "./timer-countdown";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useEffect, useMemo, useState } from "react";

type TimelineStep = {
  title: string;
  icon: LucideIcon;
  completed: boolean;
  completedInMinutes: number | null;
};

const timelineSteps: TimelineStep[] = [
  {
    title: "Introduction",
    icon: MessageSquare,
    completed: true,
    completedInMinutes: 2,
  },
  {
    title: "Coding Challenge 1",
    icon: Code,
    completed: true,
    completedInMinutes: 24,
  },
  {
    title: "Q & A",
    icon: HelpCircle,
    completed: false,
    completedInMinutes: null,
  },
];

export const WorkspaceSidebar: React.FC<{
  sessionId: Id<"sessions">;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (isSidebarCollapsed: boolean) => void;
}> = ({ sessionId, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const session = useQuery(api.sessions.getById, { sessionId });
  const completedTasks = timelineSteps.filter((step) => step.completed).length;
  const totalTasks = timelineSteps.length;
  const progressPercentage = (completedTasks / totalTasks) * 100;

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
      animate={{ width: isSidebarCollapsed ? "4rem" : "240px" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className={cn(
          "w-full flex items-center justify-between pl-4 pr-2 h-14 border-b",
          "cursor-pointer group",
          isSidebarCollapsed && "justify-center px-0"
        )}
        animate={{ paddingLeft: isSidebarCollapsed ? "0" : "1rem" }}
        transition={{ duration: 0.2 }}
      >
        <Logo showText={!isSidebarCollapsed} />
        <AnimatePresence>
          {!isSidebarCollapsed && (
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
                  onClick={() => setIsSidebarCollapsed(true)}
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
            {isSidebarCollapsed ? (
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
                      style={{ height: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground rotate-0">
                    {`${Math.round((completedTasks / totalTasks) * 100)}%`}
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
              </motion.div>
            )}
          </AnimatePresence>
          {/* Interview timeline */}
          <motion.div
            className={cn("mx-4", isSidebarCollapsed && "mx-2")}
            animate={{ marginLeft: isSidebarCollapsed ? "0.5rem" : "1rem" }}
            transition={{ duration: 0.2 }}
          >
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
                    <Timeline.Content className="space-y-2 pb-4">
                      <Timeline.Title>{step.title}</Timeline.Title>
                      <div className="flex flex-col gap-2">
                        {step.completed && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Completed in {step.completedInMinutes} minutes</span>
                          </div>
                        )}
                      </div>
                    </Timeline.Content>
                  )}
                </Timeline.Item>
              ))}
            </Timeline.Root>
          </motion.div>
        </div>

        <div className="w-full p-2 border-t">
          <TimerCountdown
            timeLeft={timeLeft}
            collapsed={isSidebarCollapsed}
            totalTime={totalTime}
          />
        </div>
      </div>
    </motion.div>
  );
};
