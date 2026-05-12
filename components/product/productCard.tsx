"use client";

import { useState } from "react";
import { Trash2, ShoppingBag, FileText, Bookmark, PackageCheck, RotateCcw } from "lucide-react";
import { useDeleteProduct, useUpdateProduct } from "@/domains/products/products.hook";
import { useCategoryStore } from "@/store/category.store";
import { AppBridge } from "@/bridge/app.bridge";
import { cn } from "@/lib/utils";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { MALL_NAMES } from "@/lib/config";
import { t } from "@/lib/i18n";
import CategoryPicker from "./categoryPicker";
import type { Product, ProductShelf } from "@/types";

type ProductCardProps = {
  product: Product;
  listVariant?: "inbox" | "archive" | "bought";
};

type ActionButtonProps = {
  label: string;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  hoverClass?: string;
};

const ActionButton = ({ label, tooltip, onClick, icon, hoverClass = "hover:bg-surface hover:text-foreground" }: ActionButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={tooltip}
    onClick={onClick}
    className={cn(
      "flex h-7 w-7 items-center justify-center rounded-full transition-all",
      "text-foreground-subtle opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
      hoverClass,
      "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
    )}
  >
    {icon}
  </button>
);

const ProductCard = ({ product, listVariant = "inbox" }: ProductCardProps) => {
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const [imgError, setImgError] = useState(false);
  const categories = useCategoryStore((s) => s.categories);

  const mallLabel = product.mall_name
    ? (MALL_NAMES[product.mall_name] ?? product.mall_name)
    : null;

  const category = product.category_id
    ? categories.find((c) => c.id === product.category_id) ?? null
    : null;

  const handleNavigate = () => {
    if (AppBridge.isFlutterWebView()) {
      AppBridge.openExternal(product.url);
    } else {
      window.open(product.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleNavigate();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProduct(product.id);
  };

  const handleShelf = (e: React.MouseEvent, shelf: ProductShelf) => {
    e.stopPropagation();
    updateProduct({ id: product.id, updates: { shelf } });
  };

  const handleCategorySelect = (id: string | null) => {
    updateProduct({ id: product.id, updates: { category_id: id } });
  };

  const isInbox = listVariant === "inbox";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${product.title} — 상품 페이지로 이동`}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative rounded-2xl bg-card shadow-card cursor-pointer",
        "transition-all duration-150 hover:shadow-md active:scale-[0.985]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDeleting && "opacity-40 pointer-events-none",
      )}
    >
      {/* ── 상단: 이미지 + 정보 ── */}
      <div className="flex overflow-hidden rounded-t-2xl">
        {/* 이미지 */}
        <div className="relative h-[124px] w-[124px] shrink-0 overflow-hidden bg-surface">
          {product.image_url && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-foreground-subtle">
              <ShoppingBag size={32} />
            </div>
          )}
        </div>

        {/* 정보 영역 — 오른쪽 열에 아이콘들이 수직 배치되므로 pr-10 */}
        <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-4 pr-10">
          {/* 쇼핑몰명 */}
          {mallLabel ? (
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-foreground-subtle">
              {mallLabel}
            </span>
          ) : (
            <span aria-hidden="true" className="h-4" />
          )}

          {/* 리테일 카테고리 (스크래핑) */}
          {product.retail_category ? (
            <p className="line-clamp-1 text-xs text-foreground-subtle">{product.retail_category}</p>
          ) : null}

          {/* 상품명 */}
          <p className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {product.title}
          </p>

          {/* 메모 */}
          {product.memo && (
            <p className="mt-0.5 line-clamp-1 flex items-center gap-1 text-sm text-foreground-subtle">
              <FileText size={12} className="shrink-0" />
              {product.memo}
            </p>
          )}

          {/* 가격 + 시간 */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
            {product.base_price != null && (
              <span className="text-base font-bold text-accent">
                {formatPrice(product.base_price)}
              </span>
            )}
            <span className="text-sm text-foreground-subtle">
              {formatRelativeTime(product.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* ── 하단: 카테고리 + 면책 ── */}
      <div
        className="flex h-[52px] items-center gap-2 border-t border-line/60 px-3.5 rounded-b-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex min-w-0 flex-1 items-center">
          <CategoryPicker
            selectedId={product.category_id}
            onSelect={handleCategorySelect}
            compact
            addStyle
          />
        </div>

        {product.base_price != null && (
          <span className="shrink-0 text-xs text-foreground-subtle">
            {t("product.price_disclaimer")}
          </span>
        )}
      </div>

      {/* ── 액션 버튼 (호버 시 노출 · 수직 배치) ── */}
      <div
        className="absolute right-2.5 top-4 flex flex-col gap-1"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        {isInbox ? (
          <>
            <ActionButton
              label={t("shelf.to_archive")}
              tooltip="보관함으로"
              onClick={(e) => handleShelf(e, "archived")}
              icon={<Bookmark size={14} />}
            />
            <ActionButton
              label={t("shelf.to_purchased")}
              tooltip="구매 완료"
              onClick={(e) => handleShelf(e, "purchased")}
              icon={<PackageCheck size={14} />}
            />
          </>
        ) : (
          <ActionButton
            label={t("shelf.restore_inbox")}
            tooltip="메인으로 되돌리기"
            onClick={(e) => handleShelf(e, "inbox")}
            icon={<RotateCcw size={14} />}
            hoverClass="hover:bg-secondary-subtle hover:text-secondary"
          />
        )}
        <ActionButton
          label={t("product.delete_button")}
          tooltip="삭제"
          onClick={handleDelete}
          icon={<Trash2 size={14} />}
          hoverClass="hover:bg-destructive-subtle hover:text-destructive"
        />
      </div>
    </div>
  );
};

export default ProductCard;
