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
    <div className="relative h-full w-full overflow-hidden bg-background/50 rounded-2xl backdrop-blur-sm">
      <div className="absolute inset-0 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg, index, allMessages) => {
            const isConsecutive =
              allMessages[index - 1]?.name === msg.name &&
              Math.abs(allMessages[index - 1]?.timestamp - msg.timestamp) <
                secondsToMilliseconds(10);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex",
                  msg.isSelf ? "justify-end" : "justify-start",
                  !isConsecutive && "mt-6"
                )}
              >
                <div className={cn("flex flex-col", msg.isSelf ? "items-end" : "items-start")}>
                  {!isConsecutive && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground">{msg.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2.5 rounded-2xl text-sm",
                      msg.isSelf
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    {msg.message}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
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
  console.log(volumeBands);
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
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
                className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                style={{
                  left: "50%",
                  top: "50%",
                  x: x - 3,
                  y: y - 3,
                }}
                animate={{
                  scale: scale,
                  opacity: 0.1 + band * 0.9,
                }}
                transition={{
                  duration: 0.1,
                }}
              />
            );
          })}
        </div>

        <motion.div
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary/10 bg-gradient-to-r from-blue-400/10 to-purple-400/10"
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
  console.log(state, audioTrack);
  return (
    <div className="flex flex-col items-center gap-8 p-10 rounded-2xl bg-card/40">
      <div className="flex items-center gap-3 bg-card px-5 py-2.5 rounded-full">
        <motion.div
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            state === "listening" && "bg-emerald-500",
            state === "thinking" && "bg-amber-500",
            state === "speaking" && "bg-primary",
            state === "connecting" && "bg-muted",
            !state && "bg-muted-foreground"
          )}
          animate={{
            scale: state ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
        <span className="text-sm text-foreground font-medium capitalize">
          {state || "Not connected"}
        </span>
      </div>

      <div className="relative w-full aspect-square rounded-2xl bg-card/50 p-4">
        {audioTrack && <WaveVisualizer audioTrack={audioTrack} />}
      </div>

      <div className="text-sm text-muted-foreground font-medium">
        {state === "listening" ? "Listening to your response..." : "Waiting for input"}
      </div>
    </div>
  );
};

export const ChatView = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  return (
    <div className="flex h-full w-full bg-background">
      <div className="relative flex-1 grid grid-cols-2 gap-6 p-6">
        <div className="h-full">
          <SessionTranscripts sessionId={sessionId} />
        </div>
        <div className="flex items-center justify-center">
          <div className="w-[600px]">
            <AudioRenderer />
          </div>
        </div>
      </div>
    </div>
  );
};
