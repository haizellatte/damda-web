import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ko } from "date-fns/locale";

/** "2026. 5. 8." 형태로 포맷 */
export const formatDate = (date: string | Date): string => {
  return format(new Date(date), "yyyy. M. d.", { locale: ko });
};

/** "방금 전", "3시간 전", "2일 전" 형태의 상대 시간 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true, locale: ko });
  if (isYesterday(d)) return "어제";
  return formatDate(d);
};

/** 숫자를 한국 통화 형식으로 포맷 — 123456 → "123,456원" */
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "-";
  return `${price.toLocaleString("ko-KR")}원`;
};

/** URL에서 도메인만 추출 — "https://m.wconcept.co.kr/..." → "m.wconcept.co.kr" */
export const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

/**
 * URL에서 쇼핑몰 키 추출 (www/m/app/mobile 서브도메인 제거 후 2차 도메인 반환)
 * "https://m.wconcept.co.kr/..." → "wconcept"
 * "https://applink.a-bly.com/..." → "a-bly"
 */
const STRIPPED_SUBDOMAINS = new Set(["www", "m", "app", "mobile", "store", "shop", "applink", "link", "api"]);

export const extractMallKey = (url: string): string | null => {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    // 앞쪽 서브도메인 중 불필요한 것 제거
    while (parts.length > 2 && STRIPPED_SUBDOMAINS.has(parts[0])) {
      parts.shift();
    }
    return parts[0] ?? null;
  } catch {
    return null;
  }
};

/** 문자열이 너무 길 때 말줄임표 처리 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
};
