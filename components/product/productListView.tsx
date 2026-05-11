"use client";

import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type FormEvent,
} from "react";
import { Link2, Loader2, AlertCircle } from "lucide-react";
import { useUiStore } from "@/store/ui.store";
import { useCategoryStore } from "@/store/category.store";
import { useProductStore } from "@/store/product.store";
import { useProducts, useAddProduct } from "@/domains/products/products.hook";
import { useScrapeUrl } from "@/domains/scrape/scrape.hook";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import ProductCard from "./productCard";
import MallFilterBar from "./mallFilterBar";
import EmptyState from "./emptyState";
import CategoryPicker from "./categoryPicker";
import SortDropdown from "./sortDropdown";
import AppShell from "@/components/AppShell";
import MemoPicker from "./memoPicker";
import Skeleton from "@/components/ui/skeleton";
import type { Product } from "@/types";

type ToastData = { id: number; message: string; type: "warning" | "error" | "success" };

type GroupSection = {
  key: string;
  label: string;
  count: number;
  items: Product[];
};

// ─── 스켈레톤 로딩 카드 ──────────────────────────────────────────────────────

const LoadingCard = () => (
  <div className="rounded-2xl bg-card shadow-card">
    <div className="flex overflow-hidden rounded-t-2xl">
      <Skeleton className="h-[124px] w-[124px] shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-4 pr-10">
        <Skeleton className="h-3 w-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-3/5 rounded" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-4 w-20 rounded" />
          <Skeleton className="h-3 w-14 rounded" />
        </div>
      </div>
    </div>
    <div className="flex h-[52px] items-center border-t border-line/60 px-3.5">
      <Skeleton className="h-8 w-28 rounded-full" />
    </div>
  </div>
);

// ─── 토스트 ───────────────────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastData["type"], string> = {
  warning: "⚠️",
  error:   "⛔",
  success: "✓",
};

const Toast = ({ data }: { data: ToastData }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="fixed left-1/2 top-5 z-50 -translate-x-1/2 flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-base font-medium text-card shadow-lg whitespace-nowrap animate-toast"
  >
    <span aria-hidden="true">{TOAST_ICONS[data.type]}</span>
    <span>{data.message}</span>
  </div>
);

// ─── 메인 뷰 ─────────────────────────────────────────────────────────────────

const ProductListView = () => {
  const { selectedMall, sortKey } = useUiStore();
  const categories = useCategoryStore((s) => s.categories);
  const categoryOrder = useMemo(() => categories.map((c) => c.id), [categories]);
  const storeProducts = useProductStore((s) => s.products);

  const { data: allProducts = [] } = useProducts({
    sortKey,
    categoryOrder,
    filter: { shelf: "inbox" },
  });

  const [urlInput, setUrlInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: scrape } = useScrapeUrl();
  const { mutateAsync: addProduct } = useAddProduct();

  useEffect(() => {
    if (!toast) return;
    const { id } = toast;
    const timer = setTimeout(
      () => setToast((prev) => (prev?.id === id ? null : prev)),
      2800,
    );
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, type: ToastData["type"] = "error") =>
    setToast({ id: Date.now(), message, type });

  const mallKeys = useMemo(
    () => [...new Set(allProducts.map((p) => p.mall_name).filter((m): m is string => m !== null))],
    [allProducts],
  );

  const filteredProducts = useMemo(
    () => (selectedMall ? allProducts.filter((p) => p.mall_name === selectedMall) : allProducts),
    [allProducts, selectedMall],
  );

  const groupedSections = useMemo((): GroupSection[] | null => {
    if (sortKey !== "category") return null;
    const sections: GroupSection[] = [];
    const knownIds = new Set(categories.map((c) => c.id));
    for (const cat of categories) {
      const items = filteredProducts.filter((p) => p.category_id === cat.id);
      if (items.length > 0) {
        sections.push({ key: cat.id, label: cat.name, count: items.length, items });
      }
    }
    const orphan = filteredProducts.filter(
      (p) => p.category_id != null && !knownIds.has(p.category_id),
    );
    if (orphan.length > 0) {
      sections.push({ key: "orphan", label: t("category.other"), count: orphan.length, items: orphan });
    }
    const uncat = filteredProducts.filter((p) => !p.category_id);
    if (uncat.length > 0) {
      sections.push({ key: "uncat", label: t("category.uncategorized"), count: uncat.length, items: uncat });
    }
    return sections;
  }, [filteredProducts, sortKey, categories]);

  const handleFocusInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef.current?.focus();
  };

  const resetForm = () => {
    setUrlInput("");
    setSelectedCategoryId(null);
    setMemoValue("");
    setInputError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      setInputError(t("product.invalid_url"));
      return;
    }

    const isDuplicate = storeProducts.some((p) => p.url === trimmed);
    if (isDuplicate) {
      showToast(t("product.duplicate"), "warning");
      return;
    }

    setInputError(null);
    setIsSaving(true);

    try {
      const result = await scrape(trimmed);
      await addProduct({
        url: trimmed,
        title: result.title || trimmed,
        image_url: result.image_url ?? null,
        mall_name: result.mall_name ?? null,
        base_price: result.base_price ?? null,
        retail_category: result.retail_category ?? null,
        category_id: selectedCategoryId ?? null,
        memo: memoValue.trim() || null,
      });
      resetForm();
      showToast(t("product.add_success"), "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : t("product.add_error");
      setInputError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background">

      {/* ── 서브 헤더 (정렬·카운트) ── */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-border bg-card px-5 py-3">
        <p className="text-sm text-foreground-subtle">
          {t("product.total_items", { count: filteredProducts.length })}
        </p>
        <SortDropdown />
      </div>

      {/* ── 쇼핑몰 필터 ── */}
      <MallFilterBar mallKeys={mallKeys} />

      {/* ── 상품 목록 ── */}
      <main className="flex-1 overflow-y-auto">
        {filteredProducts.length === 0 && !isSaving ? (
          <EmptyState hasFilter={!!selectedMall} onAddClick={handleFocusInput} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 px-5 pt-14 pb-16 sm:grid-cols-2 lg:grid-cols-3">
            {isSaving && (
              <li>
                <LoadingCard />
              </li>
            )}
            {sortKey === "category" && groupedSections
              ? groupedSections.flatMap((sec) => [
                  <li key={`head-${sec.key}`} className="col-span-full pt-2 first:pt-0">
                    <h2 className="flex items-baseline gap-2 text-lg font-bold text-foreground">
                      {sec.label}
                      <span className="text-base font-semibold text-foreground-subtle">
                        {sec.count}
                      </span>
                    </h2>
                  </li>,
                  ...sec.items.map((product) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                    </li>
                  )),
                ])
              : filteredProducts.map((product) => (
                  <li key={product.id}>
                    <ProductCard product={product} />
                  </li>
                ))}
          </ul>
        )}
      </main>

      {/* ── 하단 입력바 ── */}
      <div
        className="sticky bottom-0 z-10 border-t border-border bg-card/95 backdrop-blur-sm"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        {/* 옵션 행: 카테고리 + 메모 */}
        <div className="flex items-center gap-2 px-5 pt-4">
          <CategoryPicker
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
            compact
          />
          <MemoPicker value={memoValue} onChange={setMemoValue} />
        </div>

        {/* URL 입력 폼 */}
        <form onSubmit={handleSubmit} className="flex gap-2.5 px-5 pt-3">
          <div className="relative flex-1">
            <Link2
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-subtle"
            />
            <input
              ref={inputRef}
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder={t("product.url_placeholder")}
              aria-label={t("product.url_input_label")}
              disabled={isSaving}
              className={cn(
                "w-full rounded-full border bg-card py-2.5 pl-10 pr-4 text-base",
                "placeholder:text-foreground-subtle text-foreground outline-none transition-all",
                "disabled:opacity-50",
                inputError
                  ? "border-destructive focus:ring-2 focus:ring-[var(--color-destructive)]/20"
                  : "border-border focus:border-primary focus:ring-2 focus:ring-[var(--color-primary)]/15",
              )}
            />
          </div>
          <button
            type="submit"
            disabled={isSaving || !urlInput.trim()}
            aria-label={t("product.add")}
            className={cn(
              "shrink-0 rounded-full px-6 py-2.5 text-base font-bold whitespace-nowrap",
              "bg-primary text-primary-foreground",
              "transition-all hover:bg-primary-hover active:scale-95",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            )}
          >
            {isSaving ? <Loader2 size={17} className="animate-spin" /> : t("product.add")}
          </button>
        </form>

        {inputError && (
          <div className="mt-2 flex items-center gap-1.5 px-5 text-sm text-destructive">
            <AlertCircle size={13} className="shrink-0" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {toast && <Toast data={toast} />}
    </div>
    </AppShell>
  );
};

export default ProductListView;
