import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/config";
import type { ProductSortKey } from "@/domains/products/products.type";

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

export type { ProductSortKey as SortKey };

type UiState = {
  selectedMall: string | null;
  sortKey: ProductSortKey;
};

type UiActions = {
  setSelectedMall: (mall: string | null) => void;
  setSortKey: (key: ProductSortKey) => void;
};

// ─── 스토어 ───────────────────────────────────────────────────────────────────

export const useUiStore = create<UiState & UiActions>()(
  persist(
    (set) => ({
      selectedMall: null,
      sortKey: "category",

      setSelectedMall: (mall) => set({ selectedMall: mall }),
      setSortKey: (key) => set({ sortKey: key }),
    }),
    {
      name: STORAGE_KEYS.UI_STORE,
      partialize: (state) => ({
        selectedMall: state.selectedMall,
        sortKey: state.sortKey,
      }),
    },
  ),
);
