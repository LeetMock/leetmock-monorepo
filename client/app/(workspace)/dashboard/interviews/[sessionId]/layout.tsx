"use client";

import NotFound from "@/app/not-found";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConnection } from "@/hooks/use-connection";
import { useCodeSessionState, SessionContext } from "@/hooks/use-session-state";
import { isDefined } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from "@livekit/components-react";
import { Authenticated, AuthLoading, useQuery } from "convex/react";
import { MediaDeviceFailure } from "livekit-client";
import { redirect, useParams } from "next/navigation";
import { toast } from "sonner";

export default function InterviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const { accessToken, serverUrl, shouldConnect } = useConnection();
  const { sessionId } = useParams<{ sessionId: string }>();
  const sessionExists = useQuery(api.sessions.exists, { sessionId });

  const session = useQuery(api.sessions.getById, { sessionId: sessionId as Id<"sessions"> });

  if (!isSignedIn && isLoaded) {
    return redirect("/auth?action=signin");
  }

  if (!isDefined(session)) {
    if (sessionExists === undefined) {
      return <div>Loading...</div>;
    }

    else {
      return <NotFound />;
    }
  }

  return (
    <>
      <Authenticated>
        <LiveKitRoom
          serverUrl={serverUrl}
          token={accessToken}
          connect={shouldConnect}
          audio={true}
          video={false}
          onMediaDeviceFailure={onDeviceFailure}
          onError={() => {
            toast.error("Error connecting to LiveKit");
          }}
        >
          <SessionContext.Provider value={session}>
            {children}
          </SessionContext.Provider>
          <RoomAudioRenderer />
          <StartAudio label="Click to allow audio playback" />
        </LiveKitRoom>
      </Authenticated>
      <AuthLoading>Is Loading</AuthLoading>
    </>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}
