import { toast } from "@/components/ui/use-toast";
import EventEmitter from "eventemitter3";
import PCMPlayer from "pcm-player";
import { io, Socket } from "socket.io-client";

export interface StartInterviewRequest {
  user_id: number;
  question_id: number;
  session_period: number;
}

export interface EventResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface EndInterviewRequest {
  session_id: string;
  user_id: number;
}

export interface AgentSpeechData {
  data: Int16Array;
}

export interface UserSpeechData {
  data: ArrayBuffer;
  user_id: number;
  session_id: string;
}

export class VoicePipeline extends EventEmitter {
  player: PCMPlayer;
  isAgentTalking: boolean;
  interviewSessionId: string | undefined;
  isInterviewActive: boolean;
  socket: Socket;
  lastUserSpeechTime: number = 0;
  reaction_counts = 0;
  total_reaction_time = 0;
  constructor() {
    super();
    this.isAgentTalking = false;
    this.isInterviewActive = false;
    this.player = this.newPCMPlayer();
    this.socket = io(process.env.NEXT_PUBLIC_VOICE_PIPELINE_SOCKETIO!);

    /* Bind socket event handlers */
    this.socket.on("agent-start-talking", (data: AgentSpeechData) => {
      this.isAgentTalking = true;

      if (this.lastUserSpeechTime !== 0) {
        this.total_reaction_time +=
          (Date.now() - this.lastUserSpeechTime) / 1000;
        this.reaction_counts++;
        console.log(
          `TIME - Agent Reaction Time ${(Date.now() - this.lastUserSpeechTime) / 1000}s, Reaction counts #${this.reaction_counts} Average ${this.total_reaction_time / this.reaction_counts}s`
        );
        this.lastUserSpeechTime = 0;
      }

      this.player.volume(2);
      this.player.feed(data.data);
      console.log("voice-pipeline: Agent start talking");

      this.emit("agent-start-talking");
    });

    this.socket.on("error", (error: string) => {
      this.emit("error", "voice-pipeline-general: " + error);
    });

    /* Bind voice pipeline event handlers */
    this.on("user-start-talking", this.userStartTalkingHandler);
    this.on("user-stop-talking", this.userStopTalkingHandler);
    this.on("user-talking-stream", this.userTalkingStreamHandler);
    this.on("voice-change", this.voiceChangeHandler);
  }

  /* Helper function to emit an event and handle the response */
  /* This function is used to send data to the server and wait for a response */
  /* If acknowledge is not needed, use socket.emit directly */
  asyncSocketIOEmit = async <T>(
    eventName: string,
    data: any,
    handler: (result: EventResponse) => T
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      this.socket.emit(eventName, data, (result: EventResponse) => {
        try {
          resolve(handler(result));
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  newPCMPlayer = () => {
    return new PCMPlayer({
      inputCodec: "Int16",
      channels: 1,
      sampleRate: 24000,
      flushTime: 1000,
      fftSize: 2048,
      onended: () => {
        this.isAgentTalking = false;
        console.log("voice-pipeline: Agent stopped talking");
        this.emit("agent-stop-talking");
      },
    });
  };

  /* Handler for the event transmitted from front-end */

  userStartTalkingHandler = async (user_id: number, session_id: string) => {
    console.log("Voice-Pipeline: User started talking");
    if (this.isAgentTalking) {
      try {
        console.log("voice-pipeline: interrupting agent talking");
        this.player.destroy();
        this.player = this.newPCMPlayer();
      } catch (error) {
        console.error("Error destroying player", error);
      }
    }

    // Feed data to user-talk-stream-data
    this.socket.emit(
      "user-talk-stream-start",
      {
        session_id,
        user_id,
      },
      (response: EventResponse) => {
        if (!response.success) {
          this.emit("error", "ack: user-start-talking-failure");
        }
      }
    );
  };

  // This might be slow, non-blocking code
  userStopTalkingHandler = async (userSpeechData: UserSpeechData) => {
    console.log("Voice-Pipeline: User stopped talking");
    this.lastUserSpeechTime = Date.now();
    // this.socket.emit(
    //   "send-speech-data",
    //   userSpeechData,
    //   (sendSpeechDataResponse: EventResponse) => {
    //     if (!sendSpeechDataResponse.success) {
    //       this.emit(
    //         "error",
    //         "ack: send-speech-data-failure " + sendSpeechDataResponse.error
    //       );
    //     }
    //   }
    // );
    this.socket.emit(
      "user-talk-stream-end",
      {
        session_id: userSpeechData.session_id,
        user_id: userSpeechData.user_id,
      },
      (response: EventResponse) => {
        if (!response.success) {
          this.emit("error", "ack: user-stop-talking-failure");
        }
      }
    );
  };

  userTalkingStreamHandler = async (userSpeechData: UserSpeechData) => {
    console.log("Voice-Pipeline: User talking stream");
    this.socket.emit("user-talk-stream-data", userSpeechData);
  };

  voiceChangeHandler = async ({
    user_id,
    voice,
  }: {
    user_id: number;
    voice: string;
  }) => {
    console.log("Voice-Pipeline: Voice changed to", voice);
    this.socket.emit("voice-change", {
      data: {voice},
      user_id,
      session_id: this.interviewSessionId,
    });
  };

  /* Actions */

  startInterview = async (startInterviewRequest: StartInterviewRequest) => {
    return await this.asyncSocketIOEmit(
      "start-interview",
      startInterviewRequest,
      this.startInterviewHandler
    );
  };

  endInterview = async (user_id: number) => {
    return await this.asyncSocketIOEmit(
      "end-interview",
      { session_id: this.interviewSessionId, user_id: user_id },
      this.endInterviewHandler
    );
  };

  /* Handler for Socket.IO events */

  startInterviewHandler = (startInterviewResponse: EventResponse) => {
    toast({
      title: "Interview is starting",
      description:
        "We are initializaing the interview session, please wait for a second",
      duration: 1500,
    });
    if (startInterviewResponse.success) {
      console.log("voice-pipeline: handler: Interview started successfully");
      console.log(startInterviewResponse);
      this.interviewSessionId = startInterviewResponse.data.session_id;
      this.isInterviewActive = true;
      console.log(
        "Interview started with session id:",
        this.interviewSessionId
      );
      return this.interviewSessionId!;
    } else {
      toast({
        title: "Error",
        description: "Failed to start interview",
        duration: 1500,
      });
      throw new Error(
        "voice-pipeline: sio event handler: Failed to start interview due to error: " +
          startInterviewResponse.error
      );
    }
  };

  endInterviewHandler = (endInterviewResponse: EventResponse) => {
    if (endInterviewResponse.success) {
      this.interviewSessionId = undefined;
      this.isInterviewActive = false;
      console.log("Interview ended successfully");
    } else {
      throw new Error(
        "Failed to end interview due to error " + endInterviewResponse.error
      );
    }
  };
}
