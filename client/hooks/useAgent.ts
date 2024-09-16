import { ConnectionState, RoomEvent, Track } from "livekit-client";
import {
  useTracks,
  useRemoteParticipants,
  TrackReferenceOrPlaceholder,
  useDataChannel,
  useConnectionState,
} from "@livekit/components-react";
import { useEffect, useMemo, useState } from "react";
import { encode } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export const useAgent = (sessionId: Id<"sessions">) => {
  const [agentReceivedSessionId, setAgentReceivedSessionId] = useState(false);

  const tracks = useTracks();
  const connectionState = useConnectionState();
  const { send: sendSessionId } = useDataChannel("session-id");
  console.log(connectionState);
  // Agent server send ack to client that it received the session id
  useDataChannel("session-id-received", (message) => {
    console.log("Received session id ack", message);
    setAgentReceivedSessionId(true);
  });

  // Reset the agent received session id status whenever disconnected
  useEffect(() => {
    if (connectionState === ConnectionState.Disconnected) {
      setAgentReceivedSessionId(false);
    }
  }, [connectionState]);

  useEffect(() => {
    if (agentReceivedSessionId) return;
    if (!sessionId) return;

    // Keep sending the session id to the agent server until it is received
    if (connectionState === ConnectionState.Connected) {
      const interval = setInterval(() => {
        console.log("Sending session id to agent server", sessionId);
        sendSessionId(encode(sessionId), { reliable: true });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [agentReceivedSessionId, connectionState, sendSessionId, sessionId]);

  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });

  const agentParticipant = useMemo(() => {
    return participants.find((p) => p.isAgent);
  }, [participants]);

  const isAgentConnected = useMemo(() => {
    return agentParticipant !== undefined && agentReceivedSessionId;
  }, [agentParticipant, agentReceivedSessionId]);

  const agentAudioTrack: TrackReferenceOrPlaceholder | undefined = useMemo(() => {
    const track = tracks.find((trackRef) => {
      return trackRef.publication.kind === Track.Kind.Audio && trackRef.participant.isAgent;
    });

    if (track) return track;

    if (agentParticipant) {
      return {
        participant: agentParticipant,
        source: Track.Source.Microphone,
      };
    }

    return undefined;
  }, [tracks, agentParticipant]);

  const isAgentSpeaking = agentParticipant ? agentParticipant.isSpeaking : false;

  return {
    isAgentSpeaking,
    agentParticipant,
    isAgentConnected,
    agentAudioTrack,
  };
};
