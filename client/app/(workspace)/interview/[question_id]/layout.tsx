"use client";

import { useToast } from "@/components/ui/use-toast";
import { useConnection } from "@/hooks/useConnection";
import { useAuth } from "@clerk/clerk-react";
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from "@livekit/components-react";
import { Authenticated, AuthLoading } from "convex/react";
import { redirect } from "next/navigation";

export default function InterviewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isSignedIn, isLoaded } = useAuth();
  const { accessToken, serverUrl, shouldConnect } = useConnection();
  const toast = useToast();

  if (!isSignedIn && isLoaded) {
    return redirect("/auth?action=signin");
  }

  return (
    <>
      <Authenticated>
        <LiveKitRoom
          serverUrl={serverUrl}
          token={accessToken}
          connect={shouldConnect}
          onError={() => {
            toast.toast({
              title: "Error",
              description: "There was an error connecting to the interview room. Please try again.",
            });
          }}
        >
          {children}
          <RoomAudioRenderer />
          <StartAudio label="Click to allow audio playback" />
        </LiveKitRoom>
      </Authenticated>
      <AuthLoading>Is Loading</AuthLoading>
    </>
  );
}
