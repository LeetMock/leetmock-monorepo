import { cn } from "@/lib/utils";

export const Root = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col justify-center ", className)} {...props}>
      {children}
    </div>
  );
};

export const Item = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex gap-2", "data-[collapsed=true]:gap-0", className)} {...props}>
      {children}
    </div>
  );
};

export const Connector = ({
  className,
  icon: Icon,
  isLastItem,
  completed,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  icon: React.ComponentType<{ className?: string }>;
  isLastItem?: boolean;
  completed?: boolean;
}) => {
  return (
    <div className={cn("flex flex-col items-center min-h-16", className)} {...props}>
      <div
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-[4px] transition-all duration-200",
          completed ? "bg-primary text-primary-foreground" : "bg-accent"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      {!isLastItem && (
        <div
          className={cn(
            "flex-1 w-[1px] transition-colors duration-200",
            completed ? "bg-primary/30" : "bg-border/60"
          )}
        />
      )}
    </div>
  );
};

export const Content = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  );
};

export const Title = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "h-7 flex items-center text-sm font-semibold tracking-tight text-foreground",
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
  Content: Content,
  Title: Title,
};
