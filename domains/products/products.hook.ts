import { useMemo } from "react";
import { useProductStore } from "@/store/product.store";
import type { Product, ProductInsert } from "@/types";
import type { ProductFilter, ProductSortKey } from "./products.type";

const shelfOf = (p: Product) => p.shelf ?? "inbox";

// ─── 상품 목록 조회 ───────────────────────────────────────────────────────────

export const useProducts = ({
  filter,
  sortKey = "created_at",
  categoryOrder = [],
}: {
  filter?: ProductFilter;
  sortKey?: ProductSortKey;
  /** 카테고리순 정렬 시 사용자 카테고리 순서(앞쪽이 먼저), 미분류는 맨 뒤 */
  categoryOrder?: string[];
} = {}) => {
  const products = useProductStore((state) => state.products);

  const data = useMemo(() => {
    let result = [...products];

    if (filter?.mall_name) {
      result = result.filter((p) => p.mall_name === filter.mall_name);
    }
    if (filter?.category_id) {
      result = result.filter((p) => p.category_id === filter.category_id);
    }
    if (filter?.shelf) {
      result = result.filter((p) => shelfOf(p) === filter.shelf);
    }

    const categoryIndex = new Map(categoryOrder.map((id, i) => [id, i]));

    result.sort((a, b) => {
      switch (sortKey) {
        case "price_asc":
          return (a.base_price ?? Infinity) - (b.base_price ?? Infinity);
        case "price_desc":
          return (b.base_price ?? -Infinity) - (a.base_price ?? -Infinity);
        case "mall_name":
          return (a.mall_name ?? "").localeCompare(b.mall_name ?? "", "ko");
        case "category": {
          const ai = a.category_id != null ? categoryIndex.get(a.category_id) : undefined;
          const bi = b.category_id != null ? categoryIndex.get(b.category_id) : undefined;
          const ar = ai ?? 10_000;
          const br = bi ?? 10_000;
          if (ar !== br) return ar - br;
          if (a.category_id !== b.category_id) {
            return (a.category_id ?? "").localeCompare(b.category_id ?? "", "ko");
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [products, filter, sortKey, categoryOrder]);

  return { data, isLoading: false };
};

// ─── 상품 추가 ────────────────────────────────────────────────────────────────

export const useAddProduct = () => {
  const addToStore = useProductStore((state) => state.addProduct);

  return {
    mutateAsync: (insert: ProductInsert): Promise<Product> =>
      Promise.resolve(addToStore(insert)),
    isPending: false,
  };
};

// ─── 상품 수정 ────────────────────────────────────────────────────────────────

export const useUpdateProduct = () => {
  const updateInStore = useProductStore((state) => state.updateProduct);

  return {
    mutate: (params: { id: string; updates: Partial<Product> }) =>
      updateInStore(params.id, params.updates),
    isPending: false,
  };
};

// ─── 상품 삭제 ────────────────────────────────────────────────────────────────

export const useDeleteProduct = () => {
  const deleteFromStore = useProductStore((state) => state.deleteProduct);

  return {
    mutate: (id: string) => deleteFromStore(id),
    mutateAsync: (id: string): Promise<void> =>
      Promise.resolve(deleteFromStore(id)),
    isPending: false,
  };
};
