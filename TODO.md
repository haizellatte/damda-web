# 담다 (DAMDA) — 개발 TODO

> Phase 1 (MVP) 완성을 목표로 하는 순차 작업 목록입니다.
> 각 스텝은 독립적으로 완결되며, 이전 스텝이 완료된 이후에 다음 스텝을 진행합니다.

---

## 📐 아키텍처 컨벤션

### 파일 구조

```
app/
  layout.tsx                  # Root Layout — Provider 연결, 메타데이터
  page.tsx                    # 페이지 진입점 (로직 최소화)
  (route)/
    page.tsx
    components/               # 해당 페이지 전용 컴포넌트

bridge/
  app-bridge.ts               # Flutter WebView ↔ Web 브릿지 (SSR-safe)

components/
  ui/                         # 디자인 시스템 공용 컴포넌트 (Button, Input, Card...)

domains/
  {feature}/
    {feature}.ts              # 도메인 타입 / 모델 정의
    {feature}.api.ts          # Supabase / REST API 호출 함수
    use-{feature}.ts          # TanStack Query 훅 (useQuery / useMutation)
    components/               # 해당 도메인 전용 컴포넌트

lib/
  supabase.ts                 # Supabase 클라이언트 싱글톤
  utils.ts                    # cn() 등 공통 유틸
  format.ts                   # 날짜/가격/텍스트 포매터
  config.ts                   # 상수 (MALL_NAMES, QUERY_KEYS, ROUTES, ...)

providers/
  query-provider.tsx          # TanStack QueryClientProvider

schemas/
  {feature}.schema.ts         # Zod 스키마 (폼 유효성 검사)

store/
  {name}-store.ts             # Zustand + persist 스토어

types/
  index.ts                    # 공통 도메인 타입 (Product, Category, ...)
  supabase.ts                 # DB 스키마 타입 (자동 생성 or 수동)
```

### 핵심 규칙

| 항목 | 규칙 |
|------|------|
| **클래스 병합** | 항상 `cn()` from `@/lib/utils` 사용 |
| **날짜/가격 포맷** | `lib/format.ts`의 함수 사용 |
| **상수** | `lib/config.ts`에서 import |
| **폼 스키마** | `schemas/*.schema.ts`에 분리 |
| **스토어** | Zustand + `persist` 미들웨어, UI 상태만 저장 |
| **API 패턴** | `{feature}.ts` → `{feature}.api.ts` → `use-{feature}.ts` 3단계 |
| **AppBridge** | `bridge/app-bridge.ts`만 사용, 컴포넌트에서 직접 `window` 접근 금지 |
| **디자인 토큰** | `globals.css`의 `@theme` 변수 사용 (`bg-primary`, `text-foreground-muted` 등) |

---

## 🗂️ 작업 리스트

### ✅ STEP 0 — Supabase 클라이언트 연결
- `lib/supabase.ts` 생성 및 Supabase 클라이언트 연결

---

### ✅ ARCH — 프로젝트 아키텍처 기반 구축
- `lib/utils.ts` — `cn()` 헬퍼 (clsx + tailwind-merge)
- `lib/format.ts` — 날짜/가격/텍스트 포매터
- `lib/config.ts` — 공통 상수 (MALL_NAMES, QUERY_KEYS, ROUTES 등)
- `types/index.ts` + `types/supabase.ts` — 핵심 타입 정의
- `bridge/app-bridge.ts` — Flutter WebView 브릿지 (SSR-safe)
- `store/ui-store.ts` — Zustand + persist 스토어
- `schemas/product.schema.ts` — Zod 폼 스키마
- `providers/query-provider.tsx` — TanStack QueryClientProvider
- `app/globals.css` — 담다 브랜드 디자인 토큰 (@theme)
- `components/ui/` — Button, Input, Card, Badge, Skeleton

---

### ✅ STEP 1 — 프로젝트 기반 설정 (Foundation)
- `app/layout.tsx` 메타데이터 및 Pretendard 폰트 적용
- TanStack Query `QueryClientProvider` 래퍼 설정
- 공통 타입 정의 (`Product`, `Category`, `Profile`)
- `lib/utils.ts` 생성 (`cn` 헬퍼)

---

### ✅ STEP 2 — Supabase DB 스키마 적용
- `supabase/migrations/001_initial_schema.sql` 생성 (테이블 + RLS + 트리거)
- ⚠️ Supabase Dashboard > SQL Editor에서 직접 실행 필요
- ⚠️ Dashboard > Authentication > Providers > Anonymous Sign Ins 활성화 필요

---

### ✅ STEP 3 — 익명 인증 (Anonymous Auth)
- `providers/auth-provider.tsx` — 앱 진입 시 자동 익명 로그인
- `hooks/use-auth.ts` — `useAuth()` 훅

---

### ✅ STEP 4 — 상품 담기 API Route (Scraper)
- `app/api/scrape/route.ts` — OG tag / JSON-LD / Meta tag 파싱
- `cheerio` 패키지 HTML 파싱, 타임아웃 처리

---

### ✅ STEP 5 — 상품 CRUD (Products API Layer)
- `domains/products/products.ts` — 도메인 타입
- `domains/products/products.api.ts` — Supabase CRUD 함수
- `domains/products/use-products.ts` — TanStack Query 훅 (낙관적 삭제 포함)
- `domains/scrape/scrape.api.ts` + `domains/scrape/use-scrape.ts`

---

### ✅ STEP 6 — 메인 UI (장바구니 리스트 화면)
- `app/page.tsx` 전면 재작성
- `app/components/product-list-view.tsx` — 헤더, 정렬, 목록, 스켈레톤
- `app/components/product-card.tsx` — 이미지, 쇼핑몰 뱃지, 가격, 삭제
- `app/components/mall-filter-bar.tsx` — 보유 상품 기반 자동 필터 칩
- `app/components/empty-state.tsx` — 빈 상태 안내 화면

---

### ✅ STEP 7 — 상품 추가 UI (URL 입력 → 담기)
- `app/components/add-product-fab.tsx` — 플로팅 `+` 버튼 (safe-area 대응)
- `app/components/add-product-modal.tsx` — 2단계 바텀시트 (URL 입력 → 미리보기 → 저장)

---

### 🔲 STEP 8 — 모바일 WebView URL 수신 엔드포인트
> Flutter 앱에서 공유하기로 넘어온 URL을 수신하는 전용 API Route를 만듭니다.

- `app/api/share/route.ts` — `?url=` 파라미터로 URL 수신 후 상품 자동 저장
- 리다이렉트 처리 (저장 후 `/` 메인 화면으로)
- Deep-link URL 스킴 설계 문서 작성

---

### 🔲 STEP 9 — 카카오 로그인 + 익명 계정 연동 (Phase 2)
> 익명 사용자가 카카오로 로그인 시 기존 장바구니 데이터를 이전합니다.

- Supabase OAuth + 카카오 앱 등록 설정 안내
- `app/auth/callback/route.ts` — OAuth 콜백 처리
- 익명 → 카카오 계정 링킹(Account Linking) 로직 구현
- `components/login-button.tsx` — 카카오 로그인 버튼

---
