import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimelineRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TimelineRoot: React.FC<TimelineRootProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative space-y-4", className)} {...props}>
      {children}
    </div>
  );
};

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("relative flex gap-4", className)} {...props}>
      {children}
    </div>
  );
};

interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
  isLastItem?: boolean;
  completed?: boolean;
}

export const TimelineConnector: React.FC<TimelineConnectorProps> = ({
  className,
  icon: Icon,
  isLastItem = false,
  completed = false,
  ...props
}) => {
  return (
    <div className="relative flex items-center justify-center z-10" {...props}>
      {Icon && (
        <div className={cn(
          "h-7 w-7 rounded-full flex items-center justify-center",
          completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          className
        )}>
          {Icon && <Icon className="h-4 w-4" />}
        </div>
      )}
      {!isLastItem && (
        <div className="absolute left-3.5 top-7 h-full w-px bg-border" />
      )}
    </div>
  );
};

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
}

export const TimelineDot: React.FC<TimelineDotProps> = ({
  active = false,
  className,
  ...props
}) => {
  return (
    <div className="relative z-10 flex h-7 w-7 items-center justify-center">
      <div
        className={cn(
          "h-3 w-3 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground/30",
          className
        )}
        {...props}
      />
    </div>
  );
};

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("flex-1 pt-0.5", className)} {...props}>
      {children}
    </div>
  );
};

interface TimelineTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const TimelineTitle: React.FC<TimelineTitleProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3 className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </h3>
  );
};

export const Timeline = {
  Root: TimelineRoot,
  Item: TimelineItem,
  Connector: TimelineConnector,
  Dot: TimelineDot,
  Content: TimelineContent,
  Title: TimelineTitle,
};

export default Timeline;
