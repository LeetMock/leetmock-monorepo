import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { useDebounceCallback } from "usehooks-ts";
import { useDataChannel } from "@livekit/components-react";

import { api } from "@/convex/_generated/api";
import { Topic } from "@/lib/constants";
import { encode, getCurrentUnixTimestamp } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";

export const useCodingSession = ({ sessionId }: { sessionId: Id<"sessions"> }) => {
  const sessionData = useQuery(api.sessions.getSessionData, { sessionId });

  // const { send: sendEditorState } = useDataChannel(Topic.EditorState);

  // const syncEditorState = useCallback(
  //   (language: string, editorContent: string) => {
  //     if (connectionState !== ConnectionState.Connected) return;

  //     // serialize the data into Uint8Array
  //     const data = {
  //       language,
  //       content: editorContent,
  //       last_updated: getCurrentUnixTimestamp(),
  //     };
  //     const serializedData = JSON.stringify(data);
  //     const buffer = encode(serializedData);

  //     // send the data to the livekit data channel
  //     sendEditorState(buffer, { reliable: true, topic: Topic.EditorState });
  //   },
  //   [connectionState, sendEditorState]
  // );

  const startSession = useCallback(async () => {}, []);

  if (!sessionData) return undefined;

  return {
    session: sessionData.session,
    question: sessionData.question,
  };
};
