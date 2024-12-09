import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { useSessionSidebar } from "@/hooks/use-session-sidebar";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { LucideFileText, PanelLeftOpen, MessageCircle, X } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { CodeEditorPanel } from "./code-editor-panel";
import { CodeQuestionPanel } from "./code-question-panel";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { useAgent } from "@/hooks/use-agent";
import { useAgentChat } from "@/hooks/use-agent-chat";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/use-user-profile";

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

  const { isAgentConnected } = useAgent(sessionId);

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
    <div className="bg-background h-screen w-full flex relative">
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
        <div className="w-full h-full flex justify-center items-center p-2 pt-0 relative">
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
      <ChatWindow isAgentConnected={isAgentConnected} />
    </div>
  );
};

const ChatWindow: React.FC<{ isAgentConnected: boolean }> = ({ isAgentConnected }) => {
  const { userProfile } = useUserProfile();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const sendChatMessage = useAgentChat(isAgentConnected);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendChatMessage(message);
      setMessage("");
    }
  };

  if (!isDefined(userProfile)) {
    return null;
  }

  if (userProfile.role !== "admin") {
    return null;
  }

  return (
    <div className="absolute bottom-14 right-7 z-50">
      {isOpen ? (
        <div className="bg-background border rounded-lg shadow-lg w-80">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">[Dev] Chat with AI</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="p-3">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button onClick={() => setIsOpen(true)} className="rounded-full h-12 w-12 shadow-lg">
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
