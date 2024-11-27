import { Logo } from "@/components/logo";
import { Id } from "@/convex/_generated/dataModel";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  return (
    <div className="bg-background h-screen w-full flex">
      <div className="w-56 bg-muted flex flex-col h-full">
        <div className="w-full h-12 flex items-center pl-4">
          <Logo />
        </div>
        <div className="w-full h-full">Content</div>
      </div>
      <div className="flex flex-col justify-center items-center flex-1">
        <div className="w-full h-12 bg-muted">Header</div>
        <div className="w-full h-full">Content</div>
      </div>
    </div>
  );
};
