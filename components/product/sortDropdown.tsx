"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useUiStore } from "@/store/ui.store";
import type { ProductSortKey } from "@/domains/products/products.type";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const SORT_OPTIONS: { key: ProductSortKey; label: string }[] = [
  { key: "created_at", label: t("sort.recent") },
  { key: "price_asc",  label: t("sort.price_asc") },
  { key: "price_desc", label: t("sort.price_desc") },
  { key: "category",   label: t("sort.category") },
];

const SortDropdown = () => {
  const { sortKey, setSortKey } = useUiStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? t("sort.recent");

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleSelect = (key: ProductSortKey) => {
    setSortKey(key);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`현재 정렬: ${currentLabel}. 탭하여 변경`}
        onClick={() => setIsOpen((p) => !p)}
        className={cn(
          "flex items-center rounded-full border border-border px-3.5 py-2",
          "text-sm font-medium text-foreground-muted transition-colors",
          "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          isOpen && "bg-surface",
        )}
      >
        {currentLabel}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-30 mt-1.5 w-40 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          role="listbox"
          aria-label={t("sort.label")}
        >
          <div className="py-1">
            {SORT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={sortKey === key}
                onClick={() => handleSelect(key)}
                className={cn(
                  "flex w-full items-center gap-2 px-3.5 py-2.5 text-sm transition-colors",
                  sortKey === key
                    ? "bg-primary-subtle text-primary font-semibold"
                    : "text-foreground hover:bg-surface",
                )}
              >
                <span className="flex-1 text-left">{label}</span>
                {sortKey === key && <Check size={13} className="shrink-0 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
