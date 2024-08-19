import { RoomEvent, Track } from "livekit-client";
import {
  useTracks,
  useRemoteParticipants,
  TrackReferenceOrPlaceholder,
  useIsSpeaking,
} from "@livekit/components-react";
import { useMemo } from "react";

export const useAgent = () => {
  const tracks = useTracks();

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

  const isAgentSpeaking = agentParticipant ? agentParticipant.isSpeaking : false;

  return {
    isAgentSpeaking,
    agentParticipant,
    isAgentConnected,
    agentAudioTrack,
  };
};
