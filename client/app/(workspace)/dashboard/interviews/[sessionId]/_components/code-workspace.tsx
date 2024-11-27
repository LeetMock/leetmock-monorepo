"use client";

import { Wait } from "@/components/wait";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAgentData } from "@/hooks/use-agent";
import { useConnection } from "@/hooks/use-connection";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { cn, isDefined } from "@/lib/utils";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { LucideFileText } from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { CodeEditorPanel } from "./code-editor-panel";
import { CodeQuestionPanel } from "./code-question-panel";

export const Workspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  const { disconnect } = useConnection();
  const connectionState = useConnectionState();

  const { localParticipant } = useLocalParticipant();
  const { agentAudioTrack } = useAgentData();

  const session = useQuery(api.sessions.getById, { sessionId });
  const codeSessionState = useQuery(api.codeSessionStates.get, {
    sessionId,
  });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });

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

  const sessionData = useMemo(() => {
    if (!isDefined(session)) return undefined;

    return {
      sessionId: session._id,
      sessionStatus: session.sessionStatus,
      questionId: session.questionId,
      sessionStartTime: session.sessionStartTime,
      timeLimit: session.timeLimit,
    };
  }, [session]);

  if (session?.sessionStatus === "completed") {
    disconnect();
    useEditorStore.getState().reset();
    toast.success("Congratulations! You've completed the interview. 🎉");
    return redirect("/dashboard/interviews");
  }

  return (
    <>
      {/* <Wait data={{ sessionData }}>
        {({ sessionData }) => <WorkspaceToolbar session={sessionData} />}
      </Wait> */}
      <div className="w-full h-full flex justify-center items-center">
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
                className="border rounded-md shadow-md shrink-0"
                style={{ width: size }}
                question={questionData}
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
              <CodeEditorPanel sessionId={sessionId} questionId={question._id} />
            </>
          )}
        </Wait>
        {/* {codeSessionState?.stage === "intro" && (
          <div className="w-[40rem] h-[40rem] p-2 flex flex-col space-y-4 bg-background rounded-md shadow-md">
            <AgentTranscripts agentAudioTrack={agentAudioTrack} />
          </div>
        )} */}
      </div>
    </>
  );
};
