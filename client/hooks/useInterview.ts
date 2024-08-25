import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RetellWebClient } from "retell-client-js-sdk";
import { DEFAULT_CODE } from "@/lib/constants";
import { editor } from "monaco-editor";
import { UserSpeechData, VoicePipeline } from "@/lib/VoicePipeline";
import { useMicVAD, utils } from "@hughqing/vad-react";
import { toast } from "sonner";

export const useInterview = (initialQuestionId: number) => {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [editorWidth, setEditorWidth] = useState("calc(100% - 500px)");
  const [language, setLanguage] = useState("python");
  const [voice, setVoice] = useState("nova");
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isAgentTalking, setIsAgentTalking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [questionId, setQuestionId] = useState(initialQuestionId);

  const editorRef = useRef<editor.IStandaloneCodeEditor | undefined>(undefined);
  const retellClientRef = useRef<RetellWebClient | undefined>(undefined);
  const voicePipelineRef = useRef<VoicePipeline | undefined>(undefined);

  // convex mutations
  const updateSession = useMutation(api.sessions.update);
  const createSession = useMutation(api.sessions.create);

  // Voice Pipeline - VAD
  const vad = useMicVAD({
    modelURL: "/silero_vad.onnx",
    workletURL: "/vad.worklet.bundle.min.js",
    positiveSpeechThreshold: 0.9,
    startOnLoad: true,
    modelFetcher: (path) => {
      // custom path for fetching models
      let targetPath = null;
      if (path === "/silero_vad.onnx") {
        targetPath = path;
      } else {
        targetPath = `/_next/static/chunks/${path.split("/").pop()}`;
      }
      return fetch(targetPath).then((model) => model.arrayBuffer());
    },
    ortConfig: (ort) => {
      ort.env.wasm.wasmPaths = "/_next/static/chunks/";
    },
    additionalAudioConstraints: {
      advanced: [
        {
          echoCancellation: true,
          noiseSuppression: true,
        },
      ],
    },
    onSpeechStart: () => {
      if (voicePipelineRef.current) {
        voicePipelineRef.current?.emit("user-start-talking", userId, sessionId);
      } else {
        console.log("VoicePipeline not initialized, user not in interview");
      }
    },
    //This is debounced via user-talking-stream, no need to listen to this event
    // onSpeechEnd: (audio) => {
    //   if (voicePipelineRef.current) {
    //     // send audio to voice pipeline
    //     const wavBuffer = utils.encodeWAV(audio);
    //     if (userId === undefined || sessionId === undefined) {
    //       console.log("User ID or Session ID is undefined");
    //     }
    //     //print the current time in hh-mm-ss
    //     voicePipelineRef.current?.emit("user-stop-talking", {
    //       data: wavBuffer,
    //       user_id: userId,
    //       session_id: sessionId,
    //     } as UserSpeechData);
    //   } else {
    //     console.log("VoicePipeline not initialized");
    //   }
    // },

    onFrameProcessed: (probabilities, frame: Float32Array) => {
      if (probabilities.isSpeech > 0.9 && voicePipelineRef.current) {
        voicePipelineRef.current?.emit("user-talking-stream", {
          data: frame,
          user_id: userId,
          session_id: sessionId,
        } as UserSpeechData);
      }
    },
  });

  const handleEditorChange = async (value: string | undefined) => {
    const source = value || "";

    setCode(source);
    if (sessionId !== undefined) {
      updateSession({
        code_block: source,
        session_id: sessionId,
        time_remain: timeLeft,
      });
    }
  };

  const endInterview = useCallback(
    async (user_id: number) => {
      if (voicePipelineRef.current) {
        await voicePipelineRef.current.endInterview(user_id);
      }
      setIsInterviewActive(false);
      setSessionId(undefined);
      console.log("Submitted code:", code);
      alert("Interview ended and code submitted successfully!");
      setTimeLeft(45 * 60);
      setTranscript("");
    },
    [code]
  );

  const handleResize = (e: any, { size }: { size: { width: number } }) => {
    setEditorWidth(`calc(100% - ${size.width}px)`);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleVoiceChange = (value: string) => {
    setVoice(value);
    voicePipelineRef.current?.emit("voice-change", {
      user_id: userId,
      voice: value,
    });
  };

  const setupVoicePipeline = useCallback(() => {
    if (!voicePipelineRef.current) {
      voicePipelineRef.current = new VoicePipeline();

      voicePipelineRef.current.on("error", (error) => {
        console.error("Error from VoicePipeline: \n", error);
      });

      voicePipelineRef.current.on("agent-start-talking", () => {
        setIsAgentTalking(true);
      });

      voicePipelineRef.current.on("agent-stop-talking", () => {
        setIsAgentTalking(false);
      });
    }
  }, []);

  // const setupRetellClient = useCallback(() => {
  //   if (!retellClientRef.current) {
  //     retellClientRef.current = new RetellWebClient();

  //     retellClientRef.current.on("call_started", () =>
  //       console.log("call started")
  //     );
  //     retellClientRef.current.on("call_ended", () => {
  //       console.log("call ended");
  //       setIsInterviewActive(false);
  //       setSessionId(undefined);
  //       setTimeLeft(45 * 60); // Reset timer
  //       setTranscript("");
  //     });

  //     retellClientRef.current.on("agent_start_talking", () => {
  //       console.log("agent_start_talking");
  //       setIsAgentTalking(true);
  //     });

  //     retellClientRef.current.on("agent_stop_talking", () => {
  //       console.log("agent_stop_talking");
  //       setIsAgentTalking(false);
  //     });

  //     retellClientRef.current.on("audio", (audio) => {
  //       // Handle real-time PCM audio bytes
  //       // console.log("Received audio data", audio);
  //     });

  //     retellClientRef.current.on("update", (update) => {
  //       console.log("Received update", update);
  //       if (update.type === "transcript") {
  //         setTranscript((prev) => prev + " " + update.text);
  //       }
  //     });

  //     retellClientRef.current.on("metadata", (metadata) => {
  //       console.log("Received metadata", metadata);
  //     });

  //     // retellClientRef.current.on("error", (error) => {
  //     //   console.error("An error occurred:", error);
  //     //   endInterview(); // Make sure you have an endInterview function
  //     // });
  //   }
  // }, [endInterview]);

  const toggleInterview = useCallback(async () => {
    if (!isInterviewActive) {
      // Start Interview
      // setupRetellClient(); // Call this before starting the call
      // TODO: Add logic to retrieve interview if it already exists

      setupVoicePipeline(); // Call this before starting the call
      try {
        const session_id = await voicePipelineRef.current!.startInterview({
          user_id: 1, // Replace with actual user ID when you have authentication
          question_id: initialQuestionId,
          session_period: 45 * 60, // 45 minutes in seconds
        });

        console.log("Session ID:", session_id);

        setIsInterviewActive(true);
        setSessionId(session_id);
        setTimeLeft(45 * 60);

        updateSession({
          code_block: code,
          session_id: session_id,
          time_remain: timeLeft,
        });
      } catch (error) {
        console.error("Failed to start interview:", error);
      }
    } else {
      // End Interview logic
      endInterview(userId!);
    }
  }, [
    isInterviewActive,
    setupVoicePipeline,
    initialQuestionId,
    updateSession,
    code,
    timeLeft,
    endInterview,
    userId,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isInterviewActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            toggleInterview(); // This will end the interview and submit the code
            return 45 * 60; // Reset timer
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isInterviewActive, timeLeft, toggleInterview]);

  useEffect(() => {
    const resizeEditor = () => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    window.addEventListener("resize", resizeEditor);
    setUserId(1); // Replace with actual user ID when you have authentication
    return () => window.removeEventListener("resize", resizeEditor);
  }, []);

  return {
    code,
    language,
    timeLeft,
    isInterviewActive,
    isAgentTalking,
    transcript,
    editorRef,
    setQuestionId,
    handleEditorChange,
    toggleInterview,
    handleLanguageChange,
    handleResize,
    handleVoiceChange,
    voice,
  };
};
