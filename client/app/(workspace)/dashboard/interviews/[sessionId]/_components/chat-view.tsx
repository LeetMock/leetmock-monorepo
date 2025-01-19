import { Id } from "@/convex/_generated/dataModel";
import { useAgentData } from "@/hooks/use-agent";
import { cn, isDefined, secondsToMilliseconds } from "@/lib/utils";
import {
  TrackReference,
  useConnectionState,
  useLocalParticipant,
  useMultibandTrackVolume,
  useTrackTranscription,
  useVoiceAssistant,
} from "@livekit/components-react";
import { motion } from "framer-motion";
import {
  ConnectionState,
  LocalParticipant,
  Participant,
  Track,
  TranscriptionSegment,
} from "livekit-client";
import { MessageSquare } from "lucide-react";
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

export const ChatView = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  return (
    <div className="flex h-full w-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[500px] border-0">
          <AudioRenderer />
        </div>
      </div>
      <div className="w-[20rem] shadow-lg">
        <SessionTranscripts sessionId={sessionId} />
      </div>
    </div>
  );
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
    <div className="relative h-full w-full overflow-hidden bg-background/50 rounded-lg backdrop-blur-sm">
      <div
        className={cn(
          "absolute inset-0 inset-y-1 overflow-y-auto px-4 space-y-4",
          `[&::-webkit-scrollbar]:w-2
           [&::-webkit-scrollbar-track]:rounded-full
           [&::-webkit-scrollbar-thumb]:rounded-full
           [&::-webkit-scrollbar-thumb]:bg-gray-300
           dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500`
        )}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground text-sm">No transcripts available yet</span>
          </div>
        ) : (
          <>
            {messages.map((_, index) => (
              <TranscriptItem key={index} messages={messages} index={index} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

const TranscriptItem = ({ messages, index }: { messages: ChatMessageType[]; index: number }) => {
  const msg = messages[index];
  const isConsecutive =
    messages[index - 1]?.name === msg.name &&
    Math.abs(messages[index - 1]?.timestamp - msg.timestamp) < secondsToMilliseconds(10);

  return (
    <div
      className={cn("flex", msg.isSelf ? "justify-end" : "justify-start", !isConsecutive && "mt-4")}
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
    </div>
  );
};

const WaveVisualizer = ({ audioTrack }: { audioTrack?: TrackReference }) => {
  const volumeBands = useMultibandTrackVolume(audioTrack, {
    bands: 36,
    loPass: 100,
    hiPass: 200,
    updateInterval: 16,
  });

  const shouldAnimate = audioTrack !== undefined;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-48">
        {/* Outer circle with a distinct joyful color */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10"
          animate={{
            scale: shouldAnimate ? [1.2, 1.4, 1.2] : 1,
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Bands with vibrant colors */}
        <div className="absolute inset-0">
          {volumeBands.map((band, idx) => {
            const rotation = (idx / volumeBands.length) * Math.PI * 2;
            const x = Math.cos(rotation) * 70;
            const y = Math.sin(rotation) * 70;
            const scale = 0.9 + band * 1.3;

            return (
              <motion.div
                key={idx}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: `hsl(${(idx / volumeBands.length) * 360}, 100%, 50%)`,
                  left: "50%",
                  top: "50%",
                  x: x - 3,
                  y: y - 3,
                }}
                animate={{
                  scale: shouldAnimate ? scale : 1,
                  opacity: shouldAnimate ? 0.2 + band * 0.8 : 0.2,
                }}
                transition={{
                  duration: 0.1,
                }}
              />
            );
          })}
        </div>

        {/* Center circle with a different gradient of joyful colors */}
        <motion.div
          className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-primary/15"
          animate={{
            scale: shouldAnimate ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Glowing effects positioned further apart */}
      <div className="absolute inset-0">
        {/* Top Vertex */}
        <div className="absolute -top-[15%] left-1/2 transform -translate-x-1/2">
          <div className="w-36 h-36 bg-pink-500 opacity-50 blur-2xl rounded-full animate-pulse"></div>
        </div>
        {/* Bottom Left Vertex */}
        <div className="absolute bottom-[2%] left-[18%]">
          <div className="w-36 h-36 bg-yellow-500 opacity-50 blur-2xl rounded-full animate-pulse"></div>
        </div>
        {/* Bottom Right Vertex */}
        <div className="absolute bottom-[2%] right-[18%]">
          <div className="w-36 h-36 bg-indigo-500 opacity-50 blur-2xl rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const AudioRenderer = () => {
  const { state, audioTrack } = useVoiceAssistant();
  const connectionState = useConnectionState();
  const isConnected = connectionState === ConnectionState.Connected;

  return (
    <div className="flex flex-col items-center gap-16 p-10 rounded-3xl backdrop-blur-sm">
      <div className="flex items-center gap-3 bg-card/80 px-5 py-2.5 rounded-full">
        <motion.div
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            state === "listening" && "bg-emerald-500",
            state === "thinking" && "bg-amber-500",
            state === "speaking" && "bg-primary",
            state === "connecting" && "bg-muted",
            state === "disconnected" && "bg-red-500"
          )}
          animate={{
            scale: isConnected ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
        <span className="text-sm text-foreground font-medium capitalize">{state}</span>
      </div>

      <div className="relative w-full aspect-square rounded-3xl p-4">
        <WaveVisualizer audioTrack={isConnected ? audioTrack : undefined} />
      </div>

      <div className="text-sm text-muted-foreground font-medium">
        {state === "listening" ? "Listening to your response..." : "Waiting for input"}
      </div>
    </div>
  );
};
