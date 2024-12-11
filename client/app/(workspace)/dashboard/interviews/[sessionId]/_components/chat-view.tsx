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
import { motion, AnimatePresence } from "framer-motion";

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

const WaveVisualizer = ({ audioTrack }: { audioTrack: TrackReference }) => {
  const volumeBands = useMultibandTrackVolume(audioTrack, {
    bands: 48,
    loPass: 100,
    hiPass: 200,
    updateInterval: 16,
  });

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-blue-500/30"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0">
          {volumeBands.map((band, idx) => {
            const rotation = (idx / volumeBands.length) * Math.PI * 2;
            const x = Math.cos(rotation) * 70;
            const y = Math.sin(rotation) * 70;
            const scale = 0.3 + band * 1.5;

            return (
              <motion.div
                key={idx}
                className="absolute w-2 h-2 rounded-full bg-blue-500"
                style={{
                  left: "50%",
                  top: "50%",
                  x: x - 4,
                  y: y - 4,
                }}
                animate={{
                  scale: scale,
                  opacity: 0.2 + band * 0.8,
                }}
                transition={{
                  duration: 0.1,
                }}
              />
            );
          })}
        </div>

        <motion.div
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-500/20"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};

const AudioRenderer = () => {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-xl bg-white/10 backdrop-blur-md w-[400px]">
      <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-full">
        <motion.div
          className={cn(
            "w-3 h-3 rounded-full",
            state === "listening" && "bg-green-500",
            state === "thinking" && "bg-yellow-500",
            state === "speaking" && "bg-blue-500",
            state === "connecting" && "bg-gray-500",
            !state && "bg-gray-300"
          )}
          animate={{
            scale: state ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
        <span className="text-sm text-white/80 font-medium capitalize">
          {state || "Not connected"}
        </span>
      </div>

      <div className="relative w-full aspect-square rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        {audioTrack && <WaveVisualizer audioTrack={audioTrack} />}
      </div>

      <div className="text-sm text-white/60 font-medium">
        {state === "listening" ? "Listening to your response..." : "Waiting for input"}
      </div>
    </div>
  );
};

export const ChatView = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  return (
    <div className="flex h-full w-full bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="flex-1 bg-white rounded-l-xl overflow-hidden">
        <SessionTranscripts sessionId={sessionId} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <AudioRenderer />
      </div>
    </div>
  );
};
