"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { useThemeStore, THEME_LIST, type ThemeName } from "@/store/theme.store";
import { cn } from "@/lib/utils";

const ThemePicker = () => {
  const { themeName, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = THEME_LIST.find((t) => t.name === themeName) ?? THEME_LIST[0];

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleSelect = (name: ThemeName) => {
    setTheme(name);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 트리거 버튼 — 현재 테마 스와치 3개 표시 */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`테마 선택 (현재: ${current.label})`}
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          "flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3",
          "text-foreground-muted transition-colors hover:bg-surface hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          isOpen && "bg-surface",
        )}
      >
        {/* 색상 스와치 점 3개 */}
        <span className="flex items-center gap-0.5" aria-hidden="true">
          {current.swatches.map((color, i) => (
            <span
              key={i}
              className="inline-block h-3 w-3 rounded-full border border-black/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
        <Palette size={14} className="shrink-0" />
      </button>

      {/* 드롭다운 패널 */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden",
            "rounded-2xl border border-border bg-card shadow-lg",
          )}
          role="listbox"
          aria-label="테마 선택"
        >
          <div className="p-1.5">
            {THEME_LIST.map((theme) => {
              const isActive = theme.name === themeName;
              return (
                <button
                  key={theme.name}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(theme.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    isActive
                      ? "bg-secondary-subtle"
                      : "hover:bg-surface",
                  )}
                >
                  {/* 스와치 3점 */}
                  <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
                    {theme.swatches.map((color, i) => (
                      <span
                        key={i}
                        className="inline-block h-4 w-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>

                  {/* 테마 이름 */}
                  <span
                    className={cn(
                      "flex-1 text-left text-sm font-medium",
                      isActive ? "text-secondary" : "text-foreground",
                    )}
                  >
                    {theme.label}
                  </span>

                  {isActive && (
                    <Check size={13} className="shrink-0 text-secondary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
