// ─── 공통 도메인 타입 ──────────────────────────────────────────────────────────
// Supabase 없이 localStorage 기반으로 동작. user_id 불필요.

export type Category = {
  id: string;
  name: string;
  created_at: string;
};

/** 메인 목록(inbox) / 보관(archived) / 이미 산 제품(purchased) */
export type ProductShelf = "inbox" | "archived" | "purchased";

export type Product = {
  id: string;
  category_id: string | null;
  /** 쇼핑몰 상품 카테고리(스크래핑 시 일부 몰에서만 채워짐) — 구 데이터에는 없을 수 있음 */
  retail_category?: string | null;
  /** 보관함 구분 — 구 데이터에는 없을 수 있음(inbox로 취급) */
  shelf?: ProductShelf;
  url: string;
  title: string;
  image_url: string | null;
  mall_name: string | null;
  base_price: number | null;
  current_price: number | null;
  is_out_of_stock: boolean;
  memo: string | null;
  created_at: string;
};

export type ProductInsert = {
  url: string;
  title: string;
  category_id?: string | null;
  retail_category?: string | null;
  shelf?: ProductShelf;
  image_url?: string | null;
  mall_name?: string | null;
  base_price?: number | null;
  current_price?: number | null;
  is_out_of_stock?: boolean;
  memo?: string | null;
};

export type ProductUpdate = Partial<Omit<Product, "id" | "created_at">>;

// ─── API 응답 공통 타입 ────────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// ─── 스크래핑 결과 타입 ────────────────────────────────────────────────────────

export type ScrapeResult = {
  title: string;
  image_url: string | null;
  mall_name: string | null;
  base_price: number | null;
  retail_category: string | null;
};
