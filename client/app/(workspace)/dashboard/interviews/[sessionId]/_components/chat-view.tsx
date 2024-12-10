import { Id } from "@/convex/_generated/dataModel";
import { useAgentData } from "@/hooks/use-agent";
import { cn, isDefined, secondsToMilliseconds } from "@/lib/utils";
import {
  AgentState,
  BarVisualizer,
  useLocalParticipant,
  useTrackTranscription,
  useVoiceAssistant,
} from "@livekit/components-react";
import { LocalParticipant, Participant, Track, TranscriptionSegment } from "livekit-client";
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

export const AudioRenderer = () => {
  const { state, audioTrack } = useVoiceAssistant();
  console.log(audioTrack, state);
  return (
    <div className="h-[300px] max-w-[90vw] mx-auto bg-green-50">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer bg-red-50"
        options={{ minHeight: 24 }}
      />
    </div>
  );
};

export const ChatView = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  return (
    <div className="flex h-full w-full">
      <div className="flex-1">
        <SessionTranscripts sessionId={sessionId} />
      </div>
      <div className="flex-1 bg-blue-50">
        <AudioRenderer />
      </div>
    </div>
  );
};
