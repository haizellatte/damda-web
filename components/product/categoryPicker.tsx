"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import { useCategoryStore, type Category } from "@/store/category.store";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

type CategoryPickerProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  compact?: boolean;
  /** true → 마운트 즉시 패널 열기. 선택 없이 닫히면 onClose 호출 */
  autoOpen?: boolean;
  onClose?: () => void;
};

const PANEL_MIN_W = 224;
const PANEL_Z     = 300;
/* 패널 최대 예상 높이 — 실제 렌더 전 공간 계산에 사용 */
const PANEL_EST_H = 300;

const CategoryPicker = ({
  selectedId,
  onSelect,
  compact = false,
  autoOpen = false,
  onClose,
}: CategoryPickerProps) => {
  const { categories, addCategory } = useCategoryStore();
  const [isOpen,    setIsOpen]   = useState(false);
  const [newName,   setNewName]  = useState("");
  const [isAdding,  setIsAdding] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    visibility: "hidden",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const addInputRef  = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  const closePanel = useCallback((withSelection: boolean) => {
    setIsOpen(false);
    setIsAdding(false);
    setNewName("");
    setPanelStyle({ visibility: "hidden" });
    if (!withSelection && autoOpen) onClose?.();
  }, [autoOpen, onClose]);

  /* ── 포지션 계산 ─────────────────────────────────────────────────────── */
  const updatePanelPosition = useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;
    /* 실제 패널 높이가 있으면 사용, 없으면 추정값 */
    const panelH = panelRef.current?.offsetHeight || PANEL_EST_H;
    const margin = 8;

    const spaceBelow = vh - rect.bottom - margin;
    const openAbove  = spaceBelow < panelH && rect.top > panelH;

    let top: number;
    if (openAbove) {
      top = rect.top - panelH - 6;
    } else {
      top = rect.bottom + 6;
    }
    top = Math.max(margin, Math.min(top, vh - panelH - margin));

    const w    = Math.max(PANEL_MIN_W, rect.width);
    let   left = rect.left;
    if (left + w > vw - margin) left = vw - margin - w;
    left = Math.max(margin, left);

    setPanelStyle({ position: "fixed", top, left, width: w, zIndex: PANEL_Z, visibility: "visible" });
  }, []);

  /* ── isOpen → 포지션 계산 (DOM 완전 렌더 이후 실행) ─────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    /* setTimeout(0): 이 틱이 끝나고 브라우저가 포털 DOM을 실제로 페인트한 뒤 실행 */
    const timer = setTimeout(() => updatePanelPosition(), 0);
    return () => clearTimeout(timer);
  }, [isOpen, isAdding, categories.length, updatePanelPosition]);

  /* ── 스크롤/리사이즈 시 재계산 ───────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const update = () => updatePanelPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, updatePanelPosition]);

  /* ── autoOpen: 마운트 즉시 열기 (rAF 대신 setTimeout 0) ────────────── */
  useEffect(() => {
    if (!autoOpen) return;
    const timer = setTimeout(() => setIsOpen(true), 0);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 외부 클릭 닫기 ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      closePanel(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 추가 인풋 포커스 ───────────────────────────────────────────────── */
  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    closePanel(true);
  };

  const handleAddConfirm = () => {
    const name = newName.trim();
    if (!name) return;
    const cat = addCategory(name);
    handleSelect(cat.id);
  };

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); handleAddConfirm(); }
    if (e.key === "Escape") { setIsAdding(false); setNewName(""); }
  };

  /* ── 패널 JSX ───────────────────────────────────────────────────────── */
  const panel = isOpen && (
    <div
      ref={panelRef}
      style={panelStyle}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
      role="listbox"
      aria-label={t("category.select")}
    >
      <div className="max-h-56 overflow-y-auto py-1.5">
        <OptionRow
          label={t("category.none")}
          isSelected={selectedId === null}
          onClick={() => handleSelect(null)}
        />
        {categories.length === 0 && (
          <p className="px-4 py-2.5 text-sm text-foreground-subtle">
            {t("category.no_categories")}
          </p>
        )}
        {categories.map((cat: Category) => (
          <OptionRow
            key={cat.id}
            label={cat.name}
            isSelected={selectedId === cat.id}
            onClick={() => handleSelect(cat.id)}
          />
        ))}
      </div>

      <div className="h-px bg-border" />

      <div className="p-2">
        {isAdding ? (
          <div className="flex items-end gap-2 px-1 pb-1.5">
            <input
              ref={addInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="카테고리명"
              maxLength={50}
              aria-label="카테고리명"
              className={cn(
                "min-w-0 flex-1 bg-transparent px-0 pb-1",
                "border-0 border-b-2 border-border text-sm text-foreground",
                "outline-none placeholder:text-foreground-subtle",
                "focus:border-primary transition-colors",
              )}
            />
            <button
              type="button"
              onClick={handleAddConfirm}
              disabled={!newName.trim()}
              aria-label={t("category.add_button")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={() => { setIsAdding(false); setNewName(""); }}
              aria-label="취소"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground-muted hover:border-border-strong hover:text-foreground"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className={cn(
              "flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border",
              "px-3 py-2 text-sm font-medium text-foreground-muted transition-colors",
              "hover:border-primary hover:bg-primary-subtle hover:text-primary",
            )}
          >
            + {t("category.add_new")}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      {autoOpen ? (
        /*
         * autoOpen 모드: 실제 버튼과 동일한 크기의 invisible anchor.
         * containerRef 가 정확한 rect 를 갖도록 display/size 유지.
         */
        <div
          className={cn(
            "invisible pointer-events-none inline-flex items-center gap-1.5",
            "rounded-full border font-medium",
            compact ? "h-9 px-3 text-sm" : "h-10 px-4 text-base",
          )}
          aria-hidden="true"
        >
          <span>{selected ? selected.name : t("category.select_short")}</span>
        </div>
      ) : (
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={t("category.select")}
          onClick={() => setIsOpen((p) => !p)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
            compact ? "h-9 px-3 text-sm" : "h-10 px-4 text-base",
            selected
              ? "border-secondary/40 bg-secondary-subtle text-secondary"
              : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:bg-card hover:text-foreground",
          )}
        >
          <span className="max-w-[140px] truncate">
            {selected ? selected.name : t("category.select_short")}
          </span>
        </button>
      )}

      {typeof document !== "undefined" && panel != null &&
        createPortal(panel, document.body)}
    </div>
  );
};

/* ── 옵션 로우 ─────────────────────────────────────────────────────────────── */

type OptionRowProps = {
  label:      string;
  isSelected: boolean;
  onClick:    () => void;
};

const OptionRow = ({ label, isSelected, onClick }: OptionRowProps) => (
  <button
    type="button"
    role="option"
    aria-selected={isSelected}
    onClick={onClick}
    className={cn(
      "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors",
      isSelected
        ? "bg-primary-subtle text-primary font-semibold"
        : "text-foreground hover:bg-surface",
    )}
  >
    <span className="flex-1 truncate text-left">{label}</span>
    {isSelected && <Check size={13} className="shrink-0 text-primary" />}
  </button>
);

export default CategoryPicker;
