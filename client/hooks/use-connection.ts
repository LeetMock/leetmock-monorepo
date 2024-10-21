import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import type { Room } from "livekit-client";
import { create } from "zustand";

interface ConnectionState {
  accessToken?: string;
  serverUrl?: string;
  shouldConnect: boolean;
  setConnectionState: (state: {
    accessToken?: string;
    serverUrl?: string;
    shouldConnect?: boolean;
  }) => void;
}

export const useConnectionState = create<ConnectionState>((set) => ({
  accessToken: undefined,
  serverUrl: undefined,
  shouldConnect: false,
  setConnectionState: (state) => set(state),
}));

export const useConnection = (room: Room | undefined = undefined) => {
  const { accessToken, serverUrl, shouldConnect, setConnectionState } = useConnectionState();
  const getToken = useAction(api.actions.getToken);

  const connect = async () => {
    const { accessToken } = await getToken();
    if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
      throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not set");
    }

    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    setConnectionState({ accessToken, serverUrl: url, shouldConnect: true });
  };

  const disconnect = () => {
    if (room) room.disconnect();
    setConnectionState({ accessToken: undefined, serverUrl: undefined, shouldConnect: false });
  };

  return { accessToken, serverUrl, shouldConnect, connect, disconnect };
};
