import { encode, isDefined } from "@/lib/utils";
import { useConnectionState, useDataChannel } from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { useCallback, useContext } from "react";
import { SessionContext } from "./use-session-state";

export type SessionEvent = {
  type: string;
  data: any;
};

export const useSessionStateEvent = () => {
  const session = useContext(SessionContext);
  const connectionState = useConnectionState();

  if (!isDefined(session)) {
    throw new Error(
      "Session not found, make sure to call this hook inside a SessionContext.Provider"
    );
  }

  const { send: publishData } = useDataChannel(`${session._id}.event`);

  const publishEvent = useCallback(
    (event: SessionEvent) => {
      if (connectionState !== ConnectionState.Connected) return;

      publishData(encode(JSON.stringify(event)), { reliable: true });
    },
    [publishData, connectionState]
  );

  return publishEvent;
};
