import { ConnectionState, LocalParticipant, RoomEvent, Track } from "livekit-client";
import {
  useTracks,
  LiveKitRoom,
  useLocalParticipant,
  useRemoteParticipants,
  DisconnectButton,
  useRoomContext,
  TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { StartAudio, AudioConference, useConnectionState } from "@livekit/components-react";
import { useConnection } from "@/hooks/useConnection";
import { useMemo } from "react";

export const useAgent = () => {
  const tracks = useTracks();
  const room = useRoomContext();
  const connectionState = useConnectionState();

  const participants = useRemoteParticipants({
    updateOnlyOn: [RoomEvent.ParticipantMetadataChanged],
  });

  const agentParticipant = useMemo(() => {
    return participants.find((p) => p.isAgent);
  }, [participants]);

  const isAgentConnected = useMemo(() => {
    return agentParticipant !== undefined;
  }, [agentParticipant]);

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

  return {
    agentParticipant,
    isAgentConnected,
    agentAudioTrack,
  };
};
