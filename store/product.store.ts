import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/config";
import type { Product, ProductInsert, ProductUpdate } from "@/types";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type ProductState = {
  products: Product[];
};

type ProductActions = {
  addProduct: (insert: ProductInsert) => Product;
  updateProduct: (id: string, updates: ProductUpdate) => void;
  deleteProduct: (id: string) => void;
};

// ─── 스토어 ───────────────────────────────────────────────────────────────────

export const useProductStore = create<ProductState & ProductActions>()(
  persist(
    (set) => ({
      products: [],

      addProduct: (insert) => {
        const newProduct: Product = {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          is_out_of_stock: insert.is_out_of_stock ?? false,
          current_price: insert.current_price ?? null,
          category_id: insert.category_id ?? null,
          retail_category: insert.retail_category ?? null,
          shelf: insert.shelf ?? "inbox",
          image_url: insert.image_url ?? null,
          mall_name: insert.mall_name ?? null,
          base_price: insert.base_price ?? null,
          memo: insert.memo ?? null,
          url: insert.url,
          title: insert.title,
        };
        set((state) => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    { name: STORAGE_KEYS.PRODUCTS },
  ),
);
