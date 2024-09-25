import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Config {
  showPriceBanner: boolean;
  showUpgradeCard: boolean;
  setShowPriceBanner: (showPriceBanner: boolean) => void;
  setShowUpgradeCard: (showUpgradeCard: boolean) => void;
}

export const useConfig = create(
  persist<Config>(
    (set) => ({
      showPriceBanner: true,
      showUpgradeCard: true,
      setShowPriceBanner: (showPriceBanner: boolean) => set({ showPriceBanner }),
      setShowUpgradeCard: (showUpgradeCard: boolean) => set({ showUpgradeCard }),
    }),
    {
      name: "leetmock-config",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
