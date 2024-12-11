import { Id } from "@/convex/_generated/dataModel";
import { useAgentData } from "@/hooks/use-agent";
import { cn, isDefined, secondsToMilliseconds } from "@/lib/utils";
import {
  AgentState,
  BarVisualizer,
  TrackReference,
  useLocalParticipant,
  useMultibandTrackVolume,
  useTrackTranscription,
  useVoiceAssistant,
} from "@livekit/components-react";
import {
  AudioTrack,
  LocalParticipant,
  Participant,
  Track,
  TranscriptionSegment,
} from "livekit-client";
import { useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "usehooks-ts";

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
  const msg: ChatMessageType = {
    message: s.final ? s.text : `${s.text} ...`,
    name: participant instanceof LocalParticipant ? "You" : "Agent",
    isSelf: participant instanceof LocalParticipant,
    timestamp: existingMessage?.timestamp ?? Date.now(),
  };
  return msg;
};

export const SessionTranscripts = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [transcripts, setTranscripts] = useLocalStorage<Record<string, ChatMessageType>>(
    `leetmock.transcriptions-${sessionId}`,
    {}
  );

  const { localParticipant, microphoneTrack } = useLocalParticipant();
  const { agentAudioTrack } = useAgentData();
  const agentMessages = useTrackTranscription(agentAudioTrack);
  const localMessages = useTrackTranscription({
    publication: microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant,
  });

  useEffect(() => {
    if (!isDefined(agentAudioTrack)) return;

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
    localParticipant,
    setTranscripts,
    agentAudioTrack,
    agentMessages.segments,
    localMessages.segments,
  ]);

  const messages = useMemo(() => {
    const allMessages = Object.values(transcripts);
    allMessages.sort((a, b) => a.timestamp - b.timestamp);

    return allMessages;
  }, [transcripts]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 overflow-y-auto">
        <div className="flex flex-col pb-2">
          {messages.map((msg, index, allMessages) => {
            const isConsecutive =
              allMessages[index - 1]?.name === msg.name &&
              Math.abs(allMessages[index - 1]?.timestamp - msg.timestamp) <
                secondsToMilliseconds(10);

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
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

const AudioBandVisualizer = ({ audioTrack }: { audioTrack: TrackReference }) => {
  const volumeBands = useMultibandTrackVolume(audioTrack, {
    bands: 32,
    loPass: 100,
    hiPass: 200,
    updateInterval: 16,
  });

  return (
    <div className="flex items-end justify-center h-32 gap-[2px] p-4">
      {volumeBands.map((band, idx) => (
        <div
          key={idx}
          className="w-2 bg-blue-500/80 rounded-t transition-all duration-[16ms]"
          style={{
            height: `${Math.max(4, band * 100)}%`,
            opacity: 0.3 + band * 0.7,
          }}
        />
      ))}
    </div>
  );
};

const AudioRenderer = () => {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            state === "listening" && "bg-green-500 animate-pulse",
            state === "thinking" && "bg-yellow-500 animate-pulse",
            state === "speaking" && "bg-blue-500 animate-pulse",
            state === "connecting" && "bg-gray-500",
            !state && "bg-gray-300"
          )}
        />
        <span className="text-sm text-gray-600 capitalize">{state || "Not connected"}</span>
      </div>

      <div className="relative overflow-hidden rounded-lg border bg-gray-50/50">
        {audioTrack && <AudioBandVisualizer audioTrack={audioTrack} />}
      </div>

      <div className="flex justify-between text-xs text-gray-500 px-2">
        <span>Audio Input</span>
        <span>{state === "listening" ? "Recording..." : "Idle"}</span>
      </div>
    </div>
  );
};

export const ChatView = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  return (
    <div className="flex h-full w-full">
      <div className="flex-1">
        <SessionTranscripts sessionId={sessionId} />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <AudioRenderer />
      </div>
    </div>
  );
};
