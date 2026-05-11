"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { mode, toggleMode } = useThemeStore();
  useEffect(() => setMounted(true), []);
  const isDark = mounted && mode === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? t("theme.switch_to_light") : t("theme.switch_to_dark")}
      title={isDark ? t("theme.switch_to_light") : t("theme.switch_to_dark")}
      onClick={toggleMode}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full",
        "border border-border bg-card text-foreground-muted",
        "transition-colors hover:bg-surface hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
      )}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};

export default ThemeToggle;
