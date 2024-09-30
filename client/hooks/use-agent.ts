import { ConnectionState, ParticipantKind, Track } from "livekit-client";
import {
  useTracks,
  useRemoteParticipants,
  useDataChannel,
  useConnectionState,
  useParticipantTracks,
  useParticipantAttributes,
} from "@livekit/components-react";
import { useEffect, useMemo, useState } from "react";
import { encode } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export type AgentState =
  | "disconnected"
  | "connecting"
  | "initializing"
  | "listening"
  | "thinking"
  | "speaking";

const state_attribute = "lk.agent.state";

export const useAgent = (sessionId: Id<"sessions">) => {
  const [agentReceivedSessionId, setAgentReceivedSessionId] = useState(false);

  const connectionState = useConnectionState();
  const agentParticipant = useRemoteParticipants().find((p) => p.kind === ParticipantKind.AGENT);
  const { attributes } = useParticipantAttributes({ participant: agentParticipant });
  const agentAudioTrack = useParticipantTracks(
    [Track.Source.Microphone],
    agentParticipant?.identity
  )[0];

  const { send: sendSessionId } = useDataChannel("session-id");

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
        sendSessionId(encode(sessionId), { reliable: true });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [agentReceivedSessionId, connectionState, sendSessionId, sessionId]);

  const isAgentConnected = useMemo(() => {
    return agentParticipant !== undefined && agentReceivedSessionId;
  }, [agentParticipant, agentReceivedSessionId]);

  const isAgentSpeaking = agentParticipant ? agentParticipant.isSpeaking : false;

  const state: AgentState = useMemo(() => {
    if (connectionState === ConnectionState.Disconnected) {
      return "disconnected";
    } else if (
      connectionState === ConnectionState.Connecting ||
      !agentParticipant ||
      !attributes?.[state_attribute]
    ) {
      return "connecting";
    } else {
      return attributes[state_attribute] as AgentState;
    }
  }, [attributes, agentParticipant, connectionState]);

  return {
    isAgentSpeaking,
    agentParticipant,
    isAgentConnected,
    agentAudioTrack,
    state,
  };
};
