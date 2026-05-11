"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useThemeStore, THEME_LIST } from "@/store/theme.store";

const ALL_THEME_CLASSES = THEME_LIST.map((t) => `theme-${t.name}`);

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const themeName = useThemeStore((s) => s.themeName);

  useEffect(() => {
    useThemeStore.persist.rehydrate();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove(...ALL_THEME_CLASSES);
    root.classList.add(`theme-${themeName}`);
  }, [mounted, themeName]);

  return (
    <div
      className={cn(
        "relative mx-auto w-full min-h-dvh bg-background text-foreground",
        "max-w-[min(100%,1240px)]",
        "shadow-[0_0_80px_rgba(0,0,0,0.12)]",
      )}
    >
      {children}
    </div>
  );
};

export default ThemeWrapper;
