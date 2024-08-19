import { useAgent } from "@/hooks/useAgent";
import { cn } from "@/lib/utils";
import {
  TrackReferenceOrPlaceholder,
  useLocalParticipant,
  useTracks,
  useTrackTranscription,
} from "@livekit/components-react";
import { LocalParticipant, Participant, Track, TranscriptionSegment } from "livekit-client";
import { useEffect, useMemo, useState } from "react";

type ChatMessageType = {
  name: string;
  message: string;
  isSelf: boolean;
  timestamp: number;
};

const segmentToChatMessage = (
  s: TranscriptionSegment,
  existingMessage: ChatMessageType | undefined,
  participant: Participant
): ChatMessageType => {
  console.log(existingMessage);
  const msg: ChatMessageType = {
    message: s.final ? s.text : `${s.text} ...`,
    name: participant instanceof LocalParticipant ? "You" : "Agent",
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
};

const TranscriptsInner = ({
  agentAudioTrack,
}: {
  agentAudioTrack: TrackReferenceOrPlaceholder;
}) => {
  const tracks = useTracks();
  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const [transcripts, setTranscripts] = useState<Record<string, ChatMessageType>>({});

  const agentMessages = useTrackTranscription(agentAudioTrack);
  const localMessages = useTrackTranscription({
    publication: microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });

  useEffect(() => {
    agentMessages.segments.forEach((s) =>
      setTranscripts((prev) => ({
        ...prev,
        [s.id]: segmentToChatMessage(s, prev[s.id], agentAudioTrack.participant),
      }))
    );

    localMessages.segments.forEach((s) =>
      setTranscripts((prev) => ({
        ...prev,
        [s.id]: segmentToChatMessage(s, prev[s.id], localParticipant),
      }))
    );
  }, [
    agentMessages.segments,
    localMessages.segments,
    agentAudioTrack.participant,
    localParticipant,
  ]);

  const messages = useMemo(() => {
    const allMessages = Object.values(transcripts);
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    return allMessages;
  }, [transcripts]);

  return (
    <div className="relative h-full">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex flex-col pb-2">
          {messages.map((msg, index, allMessages) => {
            const isConsecutive = allMessages[index - 1]?.name === msg.name;

            return (
              <div key={index} className="px-2">
                {index !== 0 && !isConsecutive && <div className="my-4 border-b bg-gray-200" />}
                {!isConsecutive && (
                  <div className="text-xs text-gray-500 flex justify-between">{msg.name}</div>
                )}
                <div className={cn("text-sm", isConsecutive ? "mt-1" : "mt-2")}>{msg.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const Transcripts = () => {
  const { agentAudioTrack } = useAgent();

  return agentAudioTrack ? (
    <TranscriptsInner agentAudioTrack={agentAudioTrack} />
  ) : (
    <div className="p-4 text-center text-gray-500">No agent audio track</div>
  );
};
