import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName =
  | "editorial"   // 현재 화이트 + 레드
  | "warm"        // 웜 크림 (Epalladio 스타일)
  | "playful"     // 플레이풀 크림 + 레드 (Rayo 스타일)
  | "peach"       // 피치 + 오렌지레드 (Fairy Drinks 스타일)
  | "bold"        // 옐로 크림 + 블랙 (Luffy 스타일)
  | "mono"        // 뉴트럴 그레이 미니멀
  | "wink-red"    // 마지막 시안 + 레드 primary
  | "wink-black"  // 마지막 시안 + 블랙 primary
  | "dark";       // 다크

export type ThemeConfig = {
  name: ThemeName;
  label: string;
  isDark: boolean;
  /** [배경, 카드, 강조색] */
  swatches: [string, string, string];
};

export const THEME_LIST: ThemeConfig[] = [
  { name: "editorial",  label: "에디토리얼",    isDark: false, swatches: ["#FFFFFF", "#F6F3EE", "#E8272D"] },
  { name: "warm",       label: "웜 크림",       isDark: false, swatches: ["#FAF6EF", "#FEF9F2", "#B5340A"] },
  { name: "playful",    label: "플레이풀",       isDark: false, swatches: ["#FFF8F2", "#FFFFFF", "#D93420"] },
  { name: "peach",      label: "피치",          isDark: false, swatches: ["#FFF3EC", "#FFFAF7", "#E05820"] },
  { name: "bold",       label: "볼드",          isDark: false, swatches: ["#FFFCE8", "#FFFFFF", "#111111"] },
  { name: "mono",       label: "모노",          isDark: false, swatches: ["#F8F8F6", "#FFFFFF", "#444444"] },
  { name: "wink-red",   label: "위크 · 레드",   isDark: false, swatches: ["#F7F4EF", "#FFFFFF", "#E8272D"] },
  { name: "wink-black", label: "위크 · 블랙",   isDark: false, swatches: ["#F7F4EF", "#FFFFFF", "#111111"] },
  { name: "dark",       label: "다크",          isDark: true,  swatches: ["#0F0F0F", "#222222", "#FF4046"] },
];

type ThemeState = {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  /** @deprecated kept for compat — use themeName */
  mode: "light" | "dark";
  toggleMode: () => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeName: "editorial",
      mode: "light",

      setTheme: (name) => {
        const cfg = THEME_LIST.find((t) => t.name === name);
        set({ themeName: name, mode: cfg?.isDark ? "dark" : "light" });
      },

      toggleMode: () => {
        const { themeName } = get();
        const current = THEME_LIST.find((t) => t.name === themeName);
        if (current?.isDark) {
          set({ themeName: "editorial", mode: "light" });
        } else {
          set({ themeName: "dark", mode: "dark" });
        }
      },
    }),
    { name: "damda-theme", skipHydration: true },
  ),
);
