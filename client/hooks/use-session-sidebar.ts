import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SessionSidebarState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSessionSidebar = create(
  persist<SessionSidebarState>(
    (set) => ({
      collapsed: false,
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: "leetmock-session-sidebar",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
