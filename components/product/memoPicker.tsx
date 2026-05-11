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
import { FileText, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const MEMO_MAX = 100;
const PANEL_Z = 100;

type MemoPickerProps = {
  value: string;
  onChange: (v: string) => void;
};

const MemoPicker = ({ value, onChange }: MemoPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* 패널이 열릴 때 textarea 포커스 — DOM 조작만 남김 */
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, [isOpen]);

  const updatePanelPosition = useCallback(() => {
    const trigger = containerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const panelH = panelRef.current?.offsetHeight ?? 200;
    const margin = 8;
    /* 항상 위쪽으로 열림 (하단 입력바 기준) */
    let top = rect.top - panelH - 8;
    if (top < margin) top = margin;
    let left = rect.left;
    const w = Math.min(Math.max(rect.width, 260), 360);
    if (left + w > vw - margin) left = Math.max(margin, vw - margin - w);
    setPanelStyle({ position: "fixed", top, left, width: w, zIndex: PANEL_Z });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePanelPosition();
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updatePanelPosition, true);
    window.addEventListener("resize", updatePanelPosition);
    return () => {
      window.removeEventListener("scroll", updatePanelPosition, true);
      window.removeEventListener("resize", updatePanelPosition);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      handleSave();
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen, draft]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    onChange(draft.trim());
    setIsOpen(false);
  };

  const handleClear = () => {
    setDraft("");
    onChange("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setDraft(value); // 취소 → 원래 값 복원
      setIsOpen(false);
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const hasValue = value.trim().length > 0;

  const panel = isOpen && (
    <div
      ref={panelRef}
      style={panelStyle}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <div className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">{t("memo.label")}</span>
          <span className="text-xs text-foreground-subtle">{draft.length}/{MEMO_MAX}</span>
        </div>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, MEMO_MAX))}
          onKeyDown={handleKeyDown}
          placeholder={t("memo.placeholder")}
          rows={3}
          maxLength={MEMO_MAX}
          aria-label={t("memo.label")}
          className={cn(
            "w-full resize-none rounded-lg border border-border bg-card px-3 py-2.5",
            "text-sm text-foreground placeholder:text-foreground-subtle outline-none",
            "transition-all focus:border-primary focus:ring-2 focus:ring-[var(--color-primary)]/15",
          )}
        />
      </div>

      <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-foreground-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <X size={13} />
            지우기
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Check size={13} />
          저장
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={hasValue ? `메모 있음: ${value}` : t("memo.add")}
        onClick={() => {
          if (!isOpen) setDraft(value); // 열기 전 외부 value 로 초기화
          setIsOpen((p) => !p);
        }}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
          hasValue
            ? "border-primary bg-primary-subtle text-primary"
            : "border-border bg-card text-foreground-muted hover:border-border-strong hover:bg-surface hover:text-foreground",
          isOpen && "bg-surface",
        )}
      >
        <FileText size={14} />
        {t("memo.label")}
        {hasValue && (
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        )}
      </button>

      {typeof document !== "undefined" && panel != null && createPortal(panel, document.body)}
    </div>
  );
};

export default MemoPicker;
