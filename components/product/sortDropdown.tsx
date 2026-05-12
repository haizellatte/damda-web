"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const PANEL_W  = 160;
const PANEL_Z  = 300;
const PANEL_ESTIMATED_H = 180;

const SortDropdown = () => {
  const { sortKey, setSortKey } = useUiStore();
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: "hidden" });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? t("sort.recent");

  /* ── 포지션 계산 헬퍼 ── */
  const calcPosition = useCallback((rect: DOMRect, panelH = PANEL_ESTIMATED_H): React.CSSProperties => {
    const vh     = window.innerHeight;
    const margin = 8;

    const spaceBelow = vh - rect.bottom - margin;
    const openAbove  = spaceBelow < panelH && rect.top > panelH;

    const top  = openAbove ? rect.top - panelH - 6 : rect.bottom + 6;
    const left = Math.max(margin, rect.right - PANEL_W);

    return {
      position: "fixed",
      top:      Math.max(margin, Math.min(top, vh - panelH - margin)),
      left,
      width:    PANEL_W,
      zIndex:   PANEL_Z,
    };
  }, []);

  /* ── 패널이 열린 후 실제 높이로 위치 보정 (paint 전 동기 실행) ── */
  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current || !triggerRef.current) return;
    const panelH = panelRef.current.offsetHeight;
    const rect   = triggerRef.current.getBoundingClientRect();
    setPanelStyle({ ...calcPosition(rect, panelH), visibility: "visible" });
  }, [isOpen, calcPosition]);

  /* ── 스크롤/리사이즈 시 재계산 ── */
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!triggerRef.current) return;
      const rect   = triggerRef.current.getBoundingClientRect();
      const panelH = panelRef.current?.offsetHeight ?? PANEL_ESTIMATED_H;
      setPanelStyle({ ...calcPosition(rect, panelH), visibility: "visible" });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, calcPosition]);

  /* ── 외부 클릭 닫기 ── */
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
      setPanelStyle({ visibility: "hidden" });
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const handleSelect = (key: ProductSortKey) => {
    setSortKey(key);
    setIsOpen(false);
    setPanelStyle({ visibility: "hidden" });
  };

  /* 클릭 시점에 트리거 rect를 동기로 측정 → 초기 위치를 즉시 세팅 */
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isOpen) {
      setIsOpen(false);
      setPanelStyle({ visibility: "hidden" });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPanelStyle({ ...calcPosition(rect), visibility: "hidden" });
    setIsOpen(true);
  };

  const panel = isOpen && (
    <div
      ref={panelRef}
      style={panelStyle}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
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
                : "text-foreground hover:bg-foreground/[0.06]",
            )}
          >
            <span className="flex-1 text-left">{label}</span>
            {sortKey === key && <Check size={13} className="shrink-0 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`현재 정렬: ${currentLabel}. 탭하여 변경`}
        onClick={handleToggle}
        className={cn(
          "flex items-center rounded-full border border-border px-3.5 py-2",
          "text-sm font-medium text-foreground-muted transition-colors",
          "hover:bg-foreground/[0.06] hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          isOpen && "bg-foreground/[0.06] text-foreground",
        )}
      >
        {currentLabel}
      </button>

      {typeof document !== "undefined" && panel != null &&
        createPortal(panel, document.body)}
    </>
  );
};

export default SortDropdown;
