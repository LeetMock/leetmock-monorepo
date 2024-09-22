"use client";

import React, { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { ConnectionState } from "livekit-client";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useAgent } from "@/hooks/useAgent";
import { AgentTranscripts } from "./agent-transcripts";
import { LucideFileText, LucideVolume2 } from "lucide-react";
import { cn, isDefined } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { CodeQuestionPanel } from "./code-question-panel";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { CodeEditorPanel } from "./code-editor-panel";
import { useWindowSize } from "usehooks-ts";
import { redirect } from "next/navigation";
import { useConnection } from "@/hooks/useConnection";
import { toast } from "sonner";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";

export const CodeWorkspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  const { disconnect } = useConnection();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const { isAgentConnected, isAgentSpeaking, agentAudioTrack } = useAgent(sessionId);

  const session = useQuery(api.sessions.getById, { sessionId });
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
    };
  }, [session]);

  if (session?.sessionStatus === "completed") {
    disconnect();
    toast.success("Congratulations! You've completed the interview. 🎉");
    return redirect("/dashboard/interviews");
  }

  return (
    <>
      <WorkspaceToolbar session={sessionData} />
      <div className="w-full h-full flex justify-center items-center">
        <CodeQuestionPanel
          className="border rounded-md shadow-md shrink-0"
          style={{ width: size }}
          question={questionData}
        />
        <div
          className={cn(
            "w-px h-full cursor-ew-resize px-1 transition-all hover:bg-muted-foreground/10 flex-0 rounded-full",
            isResizing ? "bg-muted-foreground/10" : "bg-transparent"
          )}
          {...resizeHandleProps}
        />
        {!!session && !!question ? (
          <CodeEditorPanel sessionId={sessionId} questionId={question._id} />
        ) : (
          <div
            className={cn(
              "flex flex-col justify-center items-center h-full w-full border",
              "bg-background rounded-md shadow-md"
            )}
          >
            {/* Some nice icon + a short description, saying question is loading */}
            <div className="flex flex-col items-center space-y-2">
              <LucideFileText className="w-10 h-10 text-muted-foreground" />
              <span className="text-muted-foreground">Loading question...</span>
            </div>
          </div>
        )}
        {/* <div className="w-[24rem] h-full p-2 flex flex-col space-y-4">
            <div className="mt-4 p-3 border rounded-md">
              <div className="text-sm font-medium flex justify-between items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <span>Agent Status:</span>
                  {isAgentConnected ? (
                    <span className="text-green-500 mt-[1px]">Connected</span>
                  ) : (
                    <span className="text-red-500 mt-[1px]">Disconnected</span>
                  )}
                </div>
                <LucideVolume2
                  className={cn(
                    "w-4 h-4 opacity-0 text-blue-500",
                    isAgentSpeaking ? "opacity-100" : ""
                  )}
                />
              </div>
            </div>
            <AgentTranscripts agentAudioTrack={agentAudioTrack} />
          </div> */}
      </div>
    </>
  );
};
