"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
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
  /**
   * true → 미선택 상태일 때 dashed border + "+ 카테고리" 스타일로 표시
   * (ProductCard 인라인 사용 시)
   */
  addStyle?: boolean;
};

const PANEL_MIN_W = 224;
const PANEL_Z = 300;
const PANEL_EST_H = 300;

const CategoryPicker = ({
  selectedId,
  onSelect,
  compact = false,
  addStyle = false,
}: CategoryPickerProps) => {
  const { categories, addCategory } = useCategoryStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    visibility: "hidden",
  });

  const containerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setIsAdding(false);
    setNewName("");
    setPanelStyle({ visibility: "hidden" });
  }, []);

  /* ── 포지션 계산 헬퍼 ── */
  const calcPosition = useCallback((triggerRect: DOMRect, panelH = PANEL_EST_H): React.CSSProperties => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;

    const spaceBelow = vh - triggerRect.bottom - margin;
    const openAbove = spaceBelow < panelH && triggerRect.top > panelH;

    let top = openAbove ? triggerRect.top - panelH - 6 : triggerRect.bottom + 6;
    top = Math.max(margin, Math.min(top, vh - panelH - margin));

    const w = Math.max(PANEL_MIN_W, triggerRect.width);
    let left = triggerRect.left;
    if (left + w > vw - margin) left = vw - margin - w;
    left = Math.max(margin, left);

    return { position: "fixed", top, left, width: w, zIndex: PANEL_Z };
  }, []);

  /* ── 패널이 열린 후 실제 높이로 위치 보정 (paint 전 동기 실행) ── */
  useLayoutEffect(() => {
    if (!isOpen || !panelRef.current || !containerRef.current) return;
    const panelH = panelRef.current.offsetHeight;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = calcPosition(rect, panelH);
    setPanelStyle({ ...pos, visibility: "visible" });
  }, [isOpen, isAdding, categories.length, calcPosition]);

  /* ── 스크롤/리사이즈 시 재계산 ── */
  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const panelH = panelRef.current?.offsetHeight || PANEL_EST_H;
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
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      closePanel();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, closePanel]);

  /* ── 추가 인풋 포커스 ── */
  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  const handleSelect = (id: string | null) => {
    onSelect(id);
    closePanel();
  };

  const handleAddConfirm = () => {
    const name = newName.trim();
    if (!name) return;
    const cat = addCategory(name);
    handleSelect(cat.id);
  };

  const handleAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddConfirm(); }
    if (e.key === "Escape") { setIsAdding(false); setNewName(""); }
  };

  /* 클릭 시점에 트리거 rect를 동기로 측정 → 초기 위치를 즉시 세팅 */
  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isOpen) {
      closePanel();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPanelStyle({ ...calcPosition(rect), visibility: "hidden" });
    setIsOpen(true);
  };

  /* ── 패널 JSX ── */
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
    <>
      <button
        ref={containerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("category.select")}
        onClick={handleToggle}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-full border font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          compact ? "h-8 min-w-[3rem] px-3 text-sm" : "h-9 min-w-[5rem] px-4 text-base",
          selected
            ? "border-secondary/40 bg-secondary-subtle text-secondary"
            : addStyle
              ? "border-dashed border-border text-foreground-subtle hover:border-secondary/50 hover:text-foreground-muted"
              : "border-border bg-surface text-foreground-muted hover:border-border-strong hover:bg-foreground/[0.06] hover:text-foreground",
        )}
      >
        <span className="max-w-[140px] truncate">
          {selected ? selected.name : addStyle ? t("category.add_card") : t("category.select_short")}
        </span>
      </button>

      {typeof document !== "undefined" && panel != null &&
        createPortal(panel, document.body)}
    </>
  );
};

/* ── 옵션 로우 ── */

type OptionRowProps = {
  label: string;
  isSelected: boolean;
  onClick: () => void;
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
        : "text-foreground hover:bg-foreground/[0.06]",
    )}
  >
    <span className="flex-1 truncate text-left">{label}</span>
    {isSelected && <Check size={13} className="shrink-0 text-primary" />}
  </button>
);

export default CategoryPicker;
