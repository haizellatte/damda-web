"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/domains/products/products.hook";
import type { ProductShelf } from "@/types";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";
import AppShell from "@/components/AppShell";
import ProductCard from "./productCard";

type ShelfTab = Extract<ProductShelf, "archived" | "purchased">;

const TABS: { value: ShelfTab; label: string }[] = [
  { value: "archived", label: "보관 중" },
  { value: "purchased", label: "구매 완료" },
];

const ShelfListView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab");
  /* URL 파라미터에서 직접 파생 — 별도 state 불필요 */
  const activeTab: ShelfTab = urlTab === "purchased" ? "purchased" : "archived";

  const { data: archivedProducts = [] } = useProducts({ sortKey: "created_at", filter: { shelf: "archived" } });
  const { data: purchasedProducts = [] } = useProducts({ sortKey: "created_at", filter: { shelf: "purchased" } });

  const countMap: Record<ShelfTab, number> = {
    archived: archivedProducts.length,
    purchased: purchasedProducts.length,
  };

  const activeProducts = activeTab === "archived" ? archivedProducts : purchasedProducts;
  const listVariant = activeTab === "archived" ? "archive" : "bought";
  const emptyText = activeTab === "archived" ? t("shelf.archive_empty") : t("shelf.bought_empty");

  const activeNavId = activeTab === "purchased" ? "bought" : "archived";

  return (
    <AppShell activeNavId={activeNavId}>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden bg-background">

        {/* ── 서브 헤더 (탭) ── */}
        <div className="shrink-0 border-b border-border bg-card px-5 py-3">

          {/* 탭 (모바일 전용 — 데스크탑은 AppShell 사이드바로 진입) */}
          <div className="flex gap-1 md:hidden">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() =>
                    router.replace(
                      tab.value === "purchased" ? "/shelf?tab=purchased" : "/shelf",
                    )
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-foreground-muted hover:bg-surface",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-xs font-semibold tabular-nums",
                      isActive ? "text-background/70" : "text-foreground-subtle",
                    )}
                  >
                    {countMap[tab.value]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 데스크탑 현재 탭 표시 */}
          <p className="hidden text-sm text-foreground-subtle md:block">
            {TABS.find((tab) => tab.value === activeTab)?.label} · {countMap[activeTab]}개
          </p>
        </div>

        {/* ── 상품 목록 ── */}
        <main className="flex-1 overflow-y-auto">
          {activeProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <p className="max-w-sm whitespace-pre-line text-sm leading-relaxed text-foreground-muted">
                {emptyText}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 px-5 pt-14 pb-16 sm:grid-cols-2 lg:grid-cols-3">
              {activeProducts.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} listVariant={listVariant} />
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </AppShell>
  );
};

export default ShelfListView;
