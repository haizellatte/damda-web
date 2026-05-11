import { z } from "zod";
import { t } from "@/lib/i18n";

const v = {
  url: {
    required: t("common.required", { field: t("field.url") }),
    invalid: t("common.invalid", { field: t("field.url") }),
    too_long: t("common.too_long", { field: t("field.url"), max: 2000 }),
  },
  title: {
    required: t("common.required", { field: t("field.title") }),
    too_long: t("common.too_long", { field: t("field.title"), max: 200 }),
  },
  image_url: {
    invalid: t("common.invalid", { field: t("field.image_url") }),
  },
  price: {
    positive: t("common.positive", { field: t("field.price") }),
  },
  category_name: {
    required: t("common.required", { field: t("field.category_name") }),
    too_long: t("common.too_long", { field: t("field.category_name"), max: 50 }),
  },
};

export const scrapeUrlSchema = z.object({
  url: z
    .string()
    .min(1, v.url.required)
    .url(v.url.invalid)
    .max(2000, v.url.too_long),
});

export type ScrapeUrlFormData = z.infer<typeof scrapeUrlSchema>;

export const addProductSchema = z.object({
  url: z.string().min(1, v.url.required).url(v.url.invalid),
  title: z.string().min(1, v.title.required).max(200, v.title.too_long),
  image_url: z.union([z.string().url(v.image_url.invalid), z.literal("")]).optional(),
  mall_name: z.string().optional(),
  base_price: z.number().positive(v.price.positive).optional(),
  category_id: z.string().optional(),
  retail_category: z.string().max(200).optional().nullable(),
  memo: z.string().max(500).optional(),
});

export type AddProductFormData = z.infer<typeof addProductSchema>;

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, v.category_name.required)
    .max(50, v.category_name.too_long),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
