import { create } from "zustand";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";

interface ConnectionState {
  accessToken?: string;
  serverUrl?: string;
  shouldConnect: boolean;
  setConnectionParams: (params: {
    accessToken?: string;
    serverUrl?: string;
    shouldConnect?: boolean;
  }) => void;
}

export const useConnectionParams = create<ConnectionState>((set) => ({
  accessToken: undefined,
  serverUrl: undefined,
  shouldConnect: false,
  setConnectionParams: (params) => set(params),
}));

export const useConnection = () => {
  const { accessToken, serverUrl, shouldConnect, setConnectionParams } = useConnectionParams();
  const getToken = useAction(api.sessions.getToken);

  const connect = async () => {
    const { accessToken } = await getToken();
    if (!process.env.NEXT_PUBLIC_LIVEKIT_URL) {
      throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not set");
    }

    const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    setConnectionParams({ accessToken, serverUrl: url, shouldConnect: true });
  };

  const disconnect = () => {
    setConnectionParams({ accessToken: undefined, serverUrl: undefined, shouldConnect: false });
  };

  return { accessToken, serverUrl, shouldConnect, connect, disconnect };
};
