import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { isDefined } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { produce } from "immer";
import { createContext, useCallback, useContext, useMemo } from "react";

type SessionEvent<T extends string, P> = {
  type: T;
  data: P;
};

type TestCase = {
  input: Record<string, any>;
  expectedOutput: any;
};

type ContentChangedEvent = SessionEvent<
  "content_changed",
  {
    before: string;
    after: string;
  }
>;

type TestcaseChangedEvent = SessionEvent<
  "testcase_changed",
  {
    before: TestCase[];
    after: TestCase[];
  }
>;

type TestcaseRemovedEvent = SessionEvent<"testcase_removed", any>;

type UserTestcaseExecutedEvent = SessionEvent<
  "user_testcase_executed",
  {
    testResults: {
      caseNumber: number;
      passed: boolean;
      input: TestCase;
      expected: any;
      actual: any;
      error: string | null;
      stdout: string | null;
    }[];
  }
>;

type CodeSessionEvent =
  | ContentChangedEvent
  | TestcaseChangedEvent
  | TestcaseRemovedEvent
  | UserTestcaseExecutedEvent;

const SessionContext = createContext<Doc<"sessions"> | undefined>(undefined);

export const useCodeSessionState = () => {
  const session = useContext(SessionContext);

  if (!isDefined(session)) {
    throw new Error(
      "Session not found, make sure to call this hook inside a SessionContext.Provider"
    );
  }

  const sessionState = useQuery(api.codeSessionStates.get, {
    sessionId: session._id,
  });
  const setSessionState = useMutation(api.codeSessionStates.set);

  const localSessionState = useMemo(() => {
    if (!isDefined(sessionState)) return undefined;

    const { _id, _creationTime, ...rest } = sessionState;

    return rest;
  }, [sessionState]);

  return [localSessionState, setSessionState] as const;
};

export const useCodeSessionStateReducer = () => {
  const [sessionState, setSessionState] = useCodeSessionState();

  const dispatch = useCallback(
    (event: CodeSessionEvent) => {
      if (!isDefined(sessionState)) return;
      switch (event.type) {
        case "content_changed":
          setSessionState(
            produce(sessionState, (draft) => {
              draft.editor.content = event.data.after;
            })
          );
          break;
        case "testcase_changed":
          setSessionState(
            produce(sessionState, (draft) => {
              draft.testcases = event.data.after;
            })
          );
          break;
        case "testcase_removed":
          setSessionState(
            produce(sessionState, (draft) => {
              draft.testcases = draft.testcases.filter((_, index) => index !== event.data);
            })
          );
          break;
        case "user_testcase_executed":
          setSessionState(
            produce(sessionState, (draft) => {
              draft.testResults = event.data.testResults;
            })
          );
          break;
      }
    },
    [sessionState, setSessionState]
  );
};
