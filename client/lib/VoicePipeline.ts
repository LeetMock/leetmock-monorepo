import { toast } from "@/components/ui/use-toast";
import EventEmitter from "eventemitter3";
import PCMPlayer from "pcm-player";
import { io, Socket } from "socket.io-client";
import debounce from "debounce";

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
  response_id: number;
}

export interface UserSpeechData {
  data: ArrayBuffer;
  user_id: number;
  session_id: string;
}

export class VoicePipeline extends EventEmitter {
  player: PCMPlayer | undefined;
  isAgentTalking: boolean;
  isUserTalking: boolean;
  interviewSessionId: string | undefined;
  isInterviewActive: boolean;
  socket: Socket;
  response_id: number = -1;

  lastUserSpeechTime: number = 0;
  reaction_counts = 0;
  total_reaction_time = 0;
  constructor() {
    super();
    this.isAgentTalking = false;
    this.isUserTalking = false;
    this.isInterviewActive = false;
    this.player = undefined;
    this.socket = io(process.env.NEXT_PUBLIC_VOICE_PIPELINE_SOCKETIO!);

    /* Bind socket event handlers */
    this.socket.on("agent-start-talking", (data: AgentSpeechData) => {
      this.isAgentTalking = true;

      if (this.isUserTalking) {
        console.log(
          `voice-pipeline: received agent speech ${data.response_id} while user talking, ignoring`
        );
        return;
      }

      if (this.lastUserSpeechTime !== 0) {
        this.total_reaction_time +=
          (Date.now() - this.lastUserSpeechTime) / 1000;
        this.reaction_counts++;
        console.log(
          `TIME - Agent Reaction Time ${(Date.now() - this.lastUserSpeechTime) / 1000}s, Reaction counts #${this.reaction_counts} Average ${this.total_reaction_time / this.reaction_counts}s`
        );
        this.lastUserSpeechTime = 0;
      }

      /* 
      if data.response_id is greater than or equal to this.response_id, then feed the data to the player
      greater than is used to prevent the player to receive outdated speech data
      equal to is used to receive the audio matching with current response_id, which is set at the time of callback of user-talk-stream-start
      */
      if (data.response_id >= this.response_id) {
        if (this.player === undefined) {
          this.player = this.newPCMPlayer();
        }
        this.player.volume(2);
        this.player.feed(data.data);
        console.log(
          `voice-pipeline: Agent start talking response_id: ${data.response_id}`
        );
        this.emit("agent-start-talking");

        // Update response_id with the latest response_id
        this.response_id = data.response_id;
      } else {
        console.log(
          `voice-pipeline: Agent speech is outdated, ignoring response_id: ${data.response_id}`
        );
      }
    });

    this.socket.on("error", (error: string) => {
      this.emit("error", "voice-pipeline-general: " + error);
    });

    /* Bind voice pipeline event handlers */
    this.on("user-start-talking", this.userStartTalkingHandler);
    // this.on("user-stop-talking", this.userStopTalkingHandler); // This is debounced via user-talking-stream, no need to listen to this event
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
      // onended: () => {
      //   this.isAgentTalking = false;
      //   console.log("voice-pipeline: Agent stopped talking");
      //   this.emit("agent-stop-talking");
      // },
    });
  };

  /* Handler for the event transmitted from front-end */

  userStartTalkingHandler = async (user_id: number, session_id: string) => {
    console.log("Voice-Pipeline: User started talking");
    this.isUserTalking = true;
    try {
      console.log(
        "voice-pipeline: interrupting agent talking by destroy current player"
      );
      this.player!.destroy();
      this.player = this.newPCMPlayer();
      this.isAgentTalking = false;
    } catch (error) {
      console.error("Error destroying player", error);
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
        this.response_id = response.data.response_id;
        console.log(
          `voice-pipeline: User start talking, callback response_id: ${this.response_id}`
        );
      }
    );
  };

  // This might be slow, non-blocking code
  userStopTalkingHandler = async (userSpeechData: UserSpeechData) => {
    console.log("Voice-Pipeline: User stopped talking");
    this.lastUserSpeechTime = Date.now();
    this.isUserTalking = false;
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

  debouncedUserStopTalking = debounce((UserSpeechData: UserSpeechData) => {
    console.log("Voice-Pipeline: User Stop Talking debounced");
    this.userStopTalkingHandler(UserSpeechData);
  }, 500);

  userTalkingStreamHandler = async (userSpeechData: UserSpeechData) => {
    console.log("Voice-Pipeline: User talking stream");
    this.socket.emit("user-talk-stream-data", userSpeechData);

    // It is possible for a very short interrupt such as coughing, VAD cannot detect the end of the speech
    // Thus no user-stop-talking event is emitted, we need to debounce the user-stop-talking event
    // so that voice pipeline can receive the user-stop-talking event even if the event is not triggered
    this.debouncedUserStopTalking(userSpeechData);
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
      data: { voice },
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
      console.log("Interview ended successfully");
      this.interviewSessionId = undefined;
      this.isInterviewActive = false;
      this.response_id = -1;
      this.isAgentTalking = false;
      this.isUserTalking = false;
    } else {
      throw new Error(
        "Failed to end interview due to error " + endInterviewResponse.error
      );
    }
  };
}
