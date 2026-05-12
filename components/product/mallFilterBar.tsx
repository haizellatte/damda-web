"use client";

import { useRef } from "react";
import { useUiStore } from "@/store/ui.store";
import { MALL_NAMES } from "@/lib/config";
import { cn } from "@/lib/utils";

type MallFilterBarProps = {
  mallKeys: string[];
};

const MallFilterBar = ({ mallKeys }: MallFilterBarProps) => {
  const { selectedMall, setSelectedMall } = useUiStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (mallKeys.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label="쇼핑몰 필터"
      className="flex gap-2 overflow-x-auto border-b border-border bg-card px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <FilterChip
        label="전체"
        isActive={selectedMall === null}
        onClick={() => setSelectedMall(null)}
      />
      {mallKeys.map((key) => (
        <FilterChip
          key={key}
          label={MALL_NAMES[key] ?? key}
          isActive={selectedMall === key}
          onClick={() => setSelectedMall(selectedMall === key ? null : key)}
        />
      ))}
    </div>
  );
};

type FilterChipProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const FilterChip = ({ label, isActive, onClick }: FilterChipProps) => (
  <button
    type="button"
    aria-pressed={isActive}
    onClick={onClick}
    className={cn(
      "flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-card text-foreground-muted hover:bg-foreground/[0.06] hover:text-foreground",
    )}
  >
    {label}
  </button>
);

export default MallFilterBar;
