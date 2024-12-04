import { cn } from "@/lib/utils";

export const Root = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col gap-4 justify-center ", className)} {...props}>
      {children}
    </div>
  );
};

export const Item = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex gap-2", className)} {...props}>
      {children}
    </div>
  );
};

export const Connector = ({
  className,
  icon: Icon,
  isLastItem,
  completed,
  isActive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon: React.ComponentType<{ className?: string }>;
  isLastItem?: boolean;
  completed?: boolean;
  isActive?: boolean;
}) => {
  return (
    <div className={cn("relative flex", className)} {...props}>
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
          completed
            ? "bg-primary text-primary-foreground"
            : isActive
              ? "bg-secondary/20 ring-2 ring-secondary"
              : "bg-accent/60"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      {!isLastItem && (
        <div
          className={cn(
            "absolute left-4 top-8 h-full w-[2px] -translate-x-1/2 transition-colors duration-200",
            completed ? "bg-primary/50" : "bg-border"
          )}
        />
      )}
    </div>
  );
};

export const Header = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  );
};

export const Content = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
};

export const Title = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "h-8 flex items-center text-sm font-semibold tracking-tight text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Timeline = {
  Root: Root,
  Item: Item,
  Connector: Connector,
  Header: Header,
  Content: Content,
  Title: Title,
};
