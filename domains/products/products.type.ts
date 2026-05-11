// ─── 상품 도메인 타입 ──────────────────────────────────────────────────────────

import type { Product, ProductInsert, ProductShelf, ProductUpdate } from "@/types";

export type { Product, ProductInsert, ProductShelf, ProductUpdate };

export type ProductSortKey = "created_at" | "mall_name" | "price_asc" | "price_desc" | "category";

export type ProductFilter = {
  mall_name?: string;
  category_id?: string;
  shelf?: ProductShelf;
};
