import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/config";
import { nanoid } from "nanoid";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
};

type CategoryState = {
  categories: Category[];
};

type CategoryActions = {
  addCategory: (name: string, emoji?: string) => Category;
  updateCategory: (id: string, patch: Partial<Pick<Category, "name" | "emoji">>) => void;
  deleteCategory: (id: string) => void;
};

// ─── 기본 이모지 팔레트 ─────────────────────────────────────────────────────────

const DEFAULT_EMOJIS = ["👗", "👟", "👜", "💄", "🧴", "🍳", "📱", "🛋️", "🧸", "🎀"];

let emojiCursor = 0;
const nextEmoji = (): string => {
  const emoji = DEFAULT_EMOJIS[emojiCursor % DEFAULT_EMOJIS.length];
  emojiCursor++;
  return emoji;
};

// ─── 스토어 ───────────────────────────────────────────────────────────────────

export const useCategoryStore = create<CategoryState & CategoryActions>()(
  persist(
    (set) => ({
      categories: [],

      addCategory: (name, emoji) => {
        const newCategory: Category = {
          id: nanoid(),
          name: name.trim(),
          emoji: emoji ?? nextEmoji(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        return newCategory;
      },

      updateCategory: (id, patch) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),
    }),
    {
      name: STORAGE_KEYS.CATEGORIES ?? "damda-categories",
    },
  ),
);
