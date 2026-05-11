import messages from "@/locales/ko.json";

type Messages = typeof messages;

type DotPath<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends string
    ? Prefix extends ""
      ? `${K & string}`
      : `${Prefix}.${K & string}`
    : T[K] extends object
      ? DotPath<T[K], Prefix extends "" ? `${K & string}` : `${Prefix}.${K & string}`>
      : never;
}[keyof T];

export type TranslationKey = DotPath<Messages>;

const getNestedValue = (key: string): string => {
  const parts = key.split(".");
  let current: unknown = messages;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return key;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : key;
};

/**
 * 점(.) 표기법으로 ko.json 값을 가져옵니다.
 * {{param}} 플레이스홀더를 두 번째 인수 객체로 치환합니다.
 *
 * @example t("product.add") → "담기"
 * @example t("common.too_long", { field: t("field.url"), max: 2000 })
 */
export const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
  const raw = getNestedValue(key);
  if (!params) return raw;
  return raw.replace(/\{\{(\w+)\}\}/g, (_, k) =>
    k in params ? String(params[k]) : `{{${k}}}`,
  );
};

export default messages;
