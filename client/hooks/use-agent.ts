import { Id } from "@/convex/_generated/dataModel";
import { encode } from "@/lib/utils";
import {
  useConnectionState,
  useDataChannel,
  useParticipantAttributes,
  useParticipantTracks,
  useRemoteParticipants,
} from "@livekit/components-react";
import { ConnectionState, ParticipantKind, Track } from "livekit-client";
import { useEffect, useMemo, useState } from "react";

export type AgentState =
  | "disconnected"
  | "connecting"
  | "initializing"
  | "listening"
  | "thinking"
  | "speaking";

const state_attribute = "lk.agent.state";
const session_id_topic = "session-id";

export const useAgentData = () => {
  const agentParticipant = useRemoteParticipants().find((p) => p.kind === ParticipantKind.AGENT);
  const agentAudioTrack = useParticipantTracks(
    [Track.Source.Microphone],
    agentParticipant?.identity
  )[0];

  return {
    agentParticipant,
    agentAudioTrack,
  };
};

export const useAgent = (sessionId: Id<"sessions">) => {
  const [agentReceivedSessionId, setAgentReceivedSessionId] = useState(false);

  const connectionState = useConnectionState();
  const { agentParticipant, agentAudioTrack } = useAgentData();
  const { attributes } = useParticipantAttributes({ participant: agentParticipant });

  // Data channel to send session id to agent server
  const { send: sendSessionId } = useDataChannel(session_id_topic);

  // Listen to agent server requesting session id from client
  useDataChannel(session_id_topic, (message) => {
    console.log("Got request for session id", message);
    sendSessionId(encode(sessionId), { reliable: true });
    setAgentReceivedSessionId(true);
  });

  // Reset the agent received session id status whenever disconnected
  useEffect(() => {
    if (connectionState === ConnectionState.Disconnected) {
      setAgentReceivedSessionId(false);
    }
  }, [connectionState]);

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
