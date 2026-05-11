// ─── 쇼핑몰 정보 ─────────────────────────────────────────────────────────────

export const MALL_NAMES: Record<string, string> = {
  musinsa: "무신사",
  coupang: "쿠팡",
  "29cm": "29CM",
  oliveyoung: "올리브영",
  ssg: "SSG닷컴",
  lotte: "롯데온",
  gmarket: "G마켓",
  auction: "옥션",
  "11st": "11번가",
  wconcept: "W컨셉",
  m: "W컨셉",
  ohou: "오늘의집",
  ably: "에이블리",
  "a-bly": "에이블리",
  zigzag: "지그재그",
  kakaostyle: "카카오스타일",
  aliexpress: "알리익스프레스",
  temu: "테무",
  naver: "네이버쇼핑",
  kakao: "카카오쇼핑",
} as const;

// ─── 라우트 ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: "/",
  SHELF: "/shelf",
  ARCHIVE: "/archive",
  BOUGHT: "/bought",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export const API_ROUTES = {
  SCRAPE: "/api/scrape",
  SHARE: "/api/share",
} as const;

// ─── TanStack Query 키 ────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  PROFILE: "profile",
} as const;

// ─── 스크래퍼 설정 ────────────────────────────────────────────────────────────

export const SCRAPE_TIMEOUT_MS = 5_000;
export const MAX_URL_LENGTH = 2_000;

// ─── 페이지네이션 ─────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
} as const;

// ─── 로컬스토리지 키 ──────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  UI_STORE:   "damda-ui-store",
  PRODUCTS:   "damda-products",
  CATEGORIES: "damda-categories",
} as const;
