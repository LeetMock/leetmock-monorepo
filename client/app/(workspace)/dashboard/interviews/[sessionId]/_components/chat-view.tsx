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
      <div className="absolute inset-0 overflow-y-auto px-4">
        <div className="flex flex-col py-4 space-y-3">
          {messages.map((msg, index, allMessages) => {
            const isConsecutive =
              allMessages[index - 1]?.name === msg.name &&
              Math.abs(allMessages[index - 1]?.timestamp - msg.timestamp) <
                secondsToMilliseconds(10);

            return (
              <div
                key={index}
                className={cn(
                  "rounded-xl p-3",
                  msg.isSelf
                    ? "ml-6 bg-blue-500/10 border border-blue-500/20"
                    : "mr-6 bg-[#1C2447] border border-white/5"
                )}
              >
                {!isConsecutive && (
                  <div className="text-xs text-white/50 mb-1 font-medium">{msg.name}</div>
                )}
                <div className={cn("text-sm", msg.isSelf ? "text-blue-200" : "text-white/90")}>
                  {msg.message}
                </div>
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
          className="absolute inset-0 rounded-full border-2 border-blue-400/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
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
                className="absolute w-2 h-2 rounded-full bg-blue-400"
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
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-blue-400/20"
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
    <div className="flex flex-col items-center gap-8 p-10 rounded-2xl bg-[#141B38]/40 border border-white/5">
      <div className="flex items-center gap-3 bg-[#1C2447] px-5 py-2.5 rounded-full border border-white/5">
        <motion.div
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            state === "listening" && "bg-emerald-500",
            state === "thinking" && "bg-amber-500",
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
        <span className="text-sm text-white/90 font-medium capitalize">
          {state || "Not connected"}
        </span>
      </div>

      <div className="relative w-full aspect-square rounded-2xl bg-[#1C2447]/50 border border-white/5 p-4">
        {audioTrack && <WaveVisualizer audioTrack={audioTrack} />}
      </div>

      <div className="text-sm text-white/70 font-medium">
        {state === "listening" ? "Listening to your response..." : "Waiting for input"}
      </div>
    </div>
  );
};

export const ChatView = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  return (
    <div className="flex h-full w-full bg-[#0A0F1E]">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[600px]">
          <AudioRenderer />
        </div>
      </div>

      <div className="w-[400px] h-full p-6 bg-[#0F1631]/50">
        <div className="h-full bg-[#141B38]/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/5">
          <SessionTranscripts sessionId={sessionId} />
        </div>
      </div>
    </div>
  );
};
