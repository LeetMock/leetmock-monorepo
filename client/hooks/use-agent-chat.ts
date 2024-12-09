import { encode } from "@/lib/utils";
import { useDataChannel } from "@livekit/components-react";
import { useCallback } from "react";

const chatMessageTopic = "chat-message";

export const useAgentChat = (isAgentConnected: boolean) => {
  const { send: sendChatMessage } = useDataChannel(chatMessageTopic);

  const chat = useCallback(
    (message: string) => {
      if (!isAgentConnected) return;

      console.log("Sending chat message", message);
      sendChatMessage(encode(message), { reliable: true });
    },
    [sendChatMessage, isAgentConnected]
  );

  return chat;
};
