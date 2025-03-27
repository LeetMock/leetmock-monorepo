import { useMapWatcher } from "@/hooks/use-map-watcher";
import { encode } from "@/lib/utils";
import { useDataChannel } from "@livekit/components-react";
import { createContext, useContext } from "react";

interface SessionStateProviderProps<T extends Record<string, any>> {
  state: T;
  setState: (state: Partial<T>) => void;
  topic: string;
  children: React.ReactNode;
}

type StateSetterPair<T extends Record<string, any>> = [T, (state: Partial<T>) => void];

const SessionStateContext = createContext<StateSetterPair<any>>([{}, () => {}]);

export const useSessionState = <T extends Record<string, any>>() => {
  const [state, setState] = useContext(SessionStateContext);

  return [state, setState] as StateSetterPair<T>;
};

export const SessionStateProvider = <T extends Record<string, any>>({
  state,
  setState,
  topic,
  children,
}: SessionStateProviderProps<T>) => {
  const { send: publishData } = useDataChannel(topic);

  useMapWatcher(state, (key, value) => {
    const update = {
      name: key,
      value,
      timestamp: Date.now(),
    };

    publishData(encode(JSON.stringify(update)), { reliable: true });
  });

  return (
    <SessionStateContext.Provider value={[state, setState]}>
      {children}
    </SessionStateContext.Provider>
  );
};
