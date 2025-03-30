import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { encode, isDefined } from "@/lib/utils";
import { useConnectionState, useDataChannel } from "@livekit/components-react";
import { useMutation, useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";

export const SessionContext = createContext<Doc<"sessions"> | undefined>(undefined);

export const useCodeSessionState = () => {
  const session = useContext(SessionContext);
  const connectionState = useConnectionState();

  if (!isDefined(session)) {
    throw new Error(
      "Session not found, make sure to call this hook inside a SessionContext.Provider"
    );
  }

  const { send: publishData } = useDataChannel(`${session._id}.state`);

  const sessionState = useQuery(api.codeSessionStates.get, {
    sessionId: session._id,
  });
  const setSessionState = useMutation(api.codeSessionStates.set);

  const localSessionState = useMemo(() => {
    if (!isDefined(sessionState)) return undefined;

    const { _id, _creationTime, sessionId, ...rest } = sessionState;

    return rest;
  }, [sessionState]);

  const setLocalSessionState = useCallback(
    (state: Partial<Omit<typeof localSessionState, "sessionId">>) => {
      setSessionState({
        sessionId: session._id,
        ...state,
      });
    },
    [setSessionState, session]
  );

  useEffect(() => {
    if (!isDefined(sessionState)) return;
    if (connectionState !== ConnectionState.Connected) return;

    publishData(encode(JSON.stringify(sessionState)), { reliable: true });
  }, [sessionState, publishData, connectionState]);

  return [localSessionState, setLocalSessionState] as const;
};
