import { Tooltip } from "@/components/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAgent } from "@/hooks/use-agent";
import { useAgentChat } from "@/hooks/use-agent-chat";
import { useConnection } from "@/hooks/use-connection";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useSessionSidebar } from "@/hooks/use-session-sidebar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { MessageCircle, PanelLeftOpen, X } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { CodeView } from "./code-view";
import { ChatView } from "./chat-view";
import { InterviewStage, STAGE_VIEW_MAPPING, StageView } from "@/lib/constants";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  const { reset } = useEditorStore();
  const { isAgentConnected } = useAgent(sessionId);
  const { collapsed, setCollapsed } = useSessionSidebar();

  const { disconnect } = useConnection();
  const connectionState = useConnectionState();

  const session = useQuery(api.sessions.getById, { sessionId });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });
  const sessionState = useQuery(api.codeSessionStates.get, { sessionId });
  const { localParticipant } = useLocalParticipant();

  const stageView = useMemo(() => {
    if (!isDefined(session)) return undefined;
    if (!isDefined(sessionState)) return undefined;

    const flow = session.interviewFlow as InterviewStage[];
    const stage = flow[sessionState.currentStageIdx];
    const view = STAGE_VIEW_MAPPING[stage];

    if (view === StageView.Coding) {
      return <ChatView sessionId={sessionId} />;
    }

    if (view === StageView.Coding) {
      return (
        <CodeView sessionId={sessionId} question={isDefined(question) ? question : undefined} />
      );
    }
  }, [question, session, sessionId, sessionState]);

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
          {stageView}
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
