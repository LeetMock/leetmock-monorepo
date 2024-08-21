import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { ConnectionState } from "livekit-client";
import { useDebounceCallback } from "usehooks-ts";
import { useDataChannel } from "@livekit/components-react";

import { api } from "@/convex/_generated/api";
import { Topic } from "@/lib/constants";
import { encode, getCurrentUnixTimestamp } from "@/lib/utils";

export const useCodingInterview = ({
  questionId,
  language: initialLanguage,
  editorContent: initialEditorContent,
  connectionState,
  syncInterval = 1000,
}: {
  questionId: number;
  language: string;
  editorContent: string;
  connectionState: ConnectionState;
  syncInterval?: number;
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [editorContent, setEditorContent] = useState(initialEditorContent);
  // const question = useQuery(api.questions.getByQuestionId, { question_id: questionId });

  const { send: sendEditorState } = useDataChannel(Topic.EditorState);

  const syncEditorState = useCallback(
    (language: string, editorContent: string) => {
      if (connectionState !== ConnectionState.Connected) return;

      // serialize the data into Uint8Array
      const data = {
        language,
        content: editorContent,
        last_updated: getCurrentUnixTimestamp(),
      };
      const serializedData = JSON.stringify(data);
      const buffer = encode(serializedData);

      // send the data to the livekit data channel
      sendEditorState(buffer, { reliable: true, topic: Topic.EditorState });
    },
    [connectionState, sendEditorState]
  );

  // debounce the sendEditorState function to sync the editor state with the server
  const syncEditorStateDebounced = useDebounceCallback(syncEditorState, syncInterval);

  // handle the editor content change
  const onEditorContentChange = useCallback(
    (content: string) => {
      setEditorContent(content);
      syncEditorStateDebounced(language, content);
    },
    [syncEditorStateDebounced, language]
  );

  // handle the language change
  const onLanguageChange = useCallback(
    (language: string) => {
      setLanguage(language);
      syncEditorStateDebounced(language, editorContent);
    },
    [syncEditorStateDebounced, editorContent]
  );

  // send the initial editor state to the server
  useEffect(() => {
    if (connectionState !== ConnectionState.Connected) return;
    console.log("sending initial editor state");
    const timeout = setTimeout(() => {
      syncEditorState(language, editorContent);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [connectionState, syncEditorState, language, editorContent]);

  return { language, editorContent, onEditorContentChange, onLanguageChange };
};
