"use client";

import React, { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WorkspaceToolbar } from "./workspace-toolbar";
import { ConnectionState } from "livekit-client";
import { useConnectionState, useLocalParticipant } from "@livekit/components-react";
import { useAgent } from "@/hooks/useAgent";
import { AgentTranscripts } from "./agent-transcripts";
import { LucideVolume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { CodeQuestionPanel } from "./code-question-panel";
import { useResizePanel } from "@/hooks/use-resize-panel";
import { CodeEditorPanel } from "./code-editor-panel";
import { useWindowSize } from "usehooks-ts";

export const CodeWorkspace: React.FC<{ sessionId: Id<"sessions"> }> = ({ sessionId }) => {
  // LiveKit
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const { isAgentConnected, isAgentSpeaking, agentAudioTrack } = useAgent(sessionId);

  // Convex
  const session = useQuery(api.sessions.getById, { sessionId });
  const question = useQuery(api.questions.getById, { questionId: session?.questionId });

  const { width = 300 } = useWindowSize();
  const { size, isResizing, resizeHandleProps } = useResizePanel({
    defaultSize: 400,
    minSize: 200,
    maxSize: width - 100,
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

  return (
    <>
      {/* Workspace Toolbar */}
      <WorkspaceToolbar sessionId={sessionId} />
      {!!session && !!question ? (
        <div className="w-full h-full flex justify-center items-center">
          {/* Question Panel */}
          <CodeQuestionPanel
            className="border rounded-md shadow-md shrink-0"
            style={{ width: size }}
            question={{ title: question.title, content: question.question }}
          />
          {/* Resize Handle */}
          <div
            className={cn(
              "w-px h-full cursor-ew-resize px-1 transition-all",
              isResizing ? "bg-muted-foreground/10" : "bg-transparent"
            )}
            {...resizeHandleProps}
          />
          {/* Coding Panel */}
          <CodeEditorPanel sessionId={sessionId} questionId={question._id} />
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
      ) : (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      )}
    </>
  );
};
