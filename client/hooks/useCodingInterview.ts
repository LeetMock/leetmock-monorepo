import { useCallback, useEffect, useState } from "react";
import { ConnectionState } from "livekit-client";
import { useDebounceCallback } from "usehooks-ts";
import { useDataChannel } from "@livekit/components-react";
import { Topic } from "@/lib/constants";
import { encode } from "@/lib/utils";

export const useCodingInterview = ({
  language: initialLanguage,
  editorContent: initialEditorContent,
  connectionState,
  syncInterval = 1000,
}: {
  language: string;
  editorContent: string;
  connectionState: ConnectionState;
  syncInterval?: number;
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [editorContent, setEditorContent] = useState(initialEditorContent);

  const { send } = useDataChannel(Topic.EditorState);

  const sendEditorState = useCallback(
    (language: string, editorContent: string) => {
      console.log("sendEditorState", language, editorContent);
      if (connectionState !== ConnectionState.Connected) return;

      // serialize the data into Uint8Array
      const data = { language, editorContent };
      const serializedData = JSON.stringify(data);
      const buffer = encode(serializedData);

      // send the data to the livekit data channel
      send(buffer, { reliable: true, topic: Topic.EditorState });
    },
    [connectionState, send]
  );

  // debounce the sendEditorState function to sync the editor state with the server
  const sendEditorStateDebounced = useDebounceCallback(sendEditorState, syncInterval);

  // handle the editor content change
  const onEditorContentChange = useCallback(
    (content: string) => {
      setEditorContent(content);
      sendEditorStateDebounced(language, content);
    },
    [sendEditorStateDebounced, language]
  );

  // handle the language change
  const onLanguageChange = useCallback(
    (language: string) => {
      setLanguage(language);
      sendEditorStateDebounced(language, editorContent);
    },
    [sendEditorStateDebounced, editorContent]
  );

  // send the initial editor state to the server
  useEffect(() => {
    console.log("useEffect", language, editorContent);
    sendEditorState(language, editorContent);
  }, []); // eslint-disable-line

  return { language, editorContent, onEditorContentChange, onLanguageChange };
};
