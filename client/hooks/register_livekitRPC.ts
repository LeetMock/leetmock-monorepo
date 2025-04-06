import { useRoomContext } from "@livekit/components-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useContext } from "react";
import { SessionContext } from "./use-session-state";
import { RpcInvocationData } from "livekit-client";
import { GET_SESSION_ID_METHOD, MUTATE_CODE_SESSION_STATE_METHOD } from "@/lib/constants";

export const useLivekitRPC = () => {
    const room = useRoomContext();
    const session = useContext(SessionContext);
    const setSessionState = useMutation(api.codeSessionStates.set);

    // Register RPC methods
    useEffect(() => {
        if (!room) return;

        // Register method to get session ID
        room.registerRpcMethod(
            GET_SESSION_ID_METHOD,
            async () => {
                if (!session) {
                    throw new Error("No session  available");
                }
                return session._id;
            }
        );

        // Register method to change stage index
        room.registerRpcMethod(
            MUTATE_CODE_SESSION_STATE_METHOD,
            async (data: RpcInvocationData) => {
                if (!session) {
                    throw new Error("No session ID available");
                }

                const payload = JSON.parse(data.payload);

                // Commit the stage switch event to Convex
                await setSessionState(payload);

                return JSON.stringify({ success: true });
            }
        );

        // Cleanup RPC methods on unmount
        return () => {
            room.unregisterRpcMethod(GET_SESSION_ID_METHOD);
            room.unregisterRpcMethod(MUTATE_CODE_SESSION_STATE_METHOD);
        };
    }, [room, session, setSessionState]);


};

export const registerLivekitRPC = () => {
    // This is now just a wrapper for backward compatibility
    return useLivekitRPC();
}