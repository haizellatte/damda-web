# 🛒 담다 (DAMDA): 통합 장바구니 앱

## 1. 프로젝트 개요 (Overview)

- **서비스명:** 담다 (DAMDA)
- **한줄 정의:** 흩어져 있는 쇼핑몰의 상품 링크를 한곳에 모으고 관리하는 통합 장바구니 하이브리드 앱
- **주요 목표:**
  - 플랫폼(무신사, 쿠팡, 29CM 등) 구분 없는 상품 수집 및 관리
  - 가격 변동 추적 및 알림을 통한 스마트한 쇼핑 경험 제공
  - 익명 로그인 기반의 낮은 진입 장벽과 심리스한 데이터 이전

---

## 2. 개발 스택 (Tech Stack)

### Frontend & Backend (Web)

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** TanStack Query v5
- **Backend As A Service:** Supabase (Auth, Database, Storage)

### Mobile (App Shell)

- **Framework:** Flutter
- **Core Packages:** `webview_flutter`, `receive_sharing_intent` (외부 링크 수신용)

---

## 3. 단계별 기능 상세 (Feature Roadmap)

| 단계              | 기능 (Feature)      | 상세 설명 (Description)                                                    |
| :---------------- | :------------------ | :------------------------------------------------------------------------- |
| **Phase 1 (MVP)** | **공유로 담기**     | 쇼핑 앱에서 '공유하기' 클릭 시 URL 수신 및 메타데이터(상품명, 이미지) 추출 |
|                   | **익명 식별**       | Supabase Anonymous Auth를 활용해 가입 절차 없이 데이터 저장 및 유지        |
|                   | **쇼핑몰 필터**     | 수집된 상품 도메인(mall_name)을 분석하여 상단 브랜드 필터 버튼 자동 생성   |
| **Phase 2 (V1)**  | **카카오 로그인**   | 카카오 OAuth 연동 및 기존 익명 계정 데이터를 카카오 계정으로 귀속(Link)    |
|                   | **카테고리 시스템** | 사용자 정의 카테고리(의류, 뷰티 등) 생성 및 상품 분류 기능                 |
|                   | **정렬 및 검색**    | 상품명 검색 및 등록일순/쇼핑몰순 정렬 기능 제공                            |
| **Phase 3 (V2)**  | **가격 추적**       | 주기적인 스크래핑을 통해 상품별 가격 변동 이력 기록 및 그래프 노출         |
|                   | **푸시 알림**       | 가격 하락 또는 품절 임박 시 Flutter 네이티브 Push 알림 전송                |
|                   | **OAuth 확장**      | 네이버, 구글 등 추가 로그인 수단 지원 및 프로필 관리                       |

---

## 4. 기술적 도전 과제 (Portfolio Points)

1. **범용 스크래퍼 설계 (Universal Web Scraper)**
   - 쇼핑몰마다 상이한 HTML 구조(CSR/SSR)에서 Open Graph 및 Meta Tag를 안정적으로 파싱하는 API Route 구현 역량
2. **하이브리드 데이터 브릿지 (Native-Web Bridge)**
   - Flutter의 네이티브 공유 인텐트(Intent)를 가로채 웹뷰의 특정 엔드포인트로 유실 없이 전달하는 데이터 파이프라인 구축 경험
3. **심리스 인증 전환 (Identity Linking)**
   - 비로그인 상태의 익명 사용자가 카카오 로그인을 완료했을 때, 기존 장바구니 데이터를 안전하게 이전(Account Linking)하는 인증 로직 설계 능력
4. **효율적 폴링 시스템 (Efficient Price Tracker)**
   - 수많은 상품 링크를 서버 부하 없이 주기적으로 체크하고 가격 변동을 감지하는 배치 프로세스 및 스케줄링 최적화 경험
5. **이벤트 기반 알림 파이프라인 (Event-driven Notification)**
   - 데이터베이스의 특정 조건(가격 하락) 만족 시 트리거를 통해 FCM으로 실시간 푸시를 전송하는 아키텍처 이해도

---

## 5. 수익화 모델 (Monetization Strategy)

| 구분 (Category)                  | 모델 (Method)                 | 상세 구현 전략 및 개발 참고사항 (Implementation & Notes)                                                                                                                                                                                                                                                                                   |
| :------------------------------- | :---------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **어필리에이트 (직접 연동)**     | 쿠팡 파트너스, 알리익스프레스 | - 자체 제휴 API를 제공하므로 1순위로 즉시 적용 가능.<br>- 사용자가 저장한 원본 링크를 클릭해 이동할 때, 파트너스 트래킹 코드를 자동으로 결합(Deep-linking)하여 수익 창출.                                                                                                                                                                  |
| **어필리에이트 (네트워크 연동)** | 무신사, 29CM, 올리브영 등     | - 쇼핑몰 자체 제휴 프로그램이 없으므로 **'링크프라이스(LinkPrice)'나 '애드픽(Adpick)'** 같은 제휴 마케팅 네트워크 플랫폼 가입 필수.<br>- **⚠️ 개발 주의:** 하이브리드(웹뷰) 앱 특성상 쿠키 유실로 전환 수익 누락 위험이 있음. 외부 브라우저(OS 기본) 연결 등 누락 방지를 위한 철저한 트래킹 테스트 요망.                                   |
| **인앱 광고 (AdMob)**            | Google AdMob (배너/네이티브)  | - **⚠️ 구글 정책 주의:** 웹뷰(Next.js) 영역에 웹용 애드센스(AdSense)를 달면 정책 위반으로 정지될 위험이 매우 높음.<br>- 반드시 **Flutter(네이티브) 단에 `google_mobile_ads` 패키지를 연동**하여 안전하게 구현할 것.<br>- **UI 최적화:** 앱 최하단 고정 배너(Banner) 및 아이템 리스트 사이 네이티브 광고(Native) 삽입으로 클릭률(CTR) 향상. |

---

## 6. 데이터베이스 스키마 (Database Schema)

```sql
-- Profiles: 사용자 추가 정보
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Categories: 유저별 카테고리 (Phase 2)
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Products: 장바구니 상품 정보
create table public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  category_id uuid references public.categories,
  url text not null,
  title text not null,
  image_url text,
  mall_name text, -- 도메인에서 자동 추출 (ex: musinsa, coupang)
  base_price numeric, -- 담았을 때 당시 가격
  current_price numeric, -- 현재 트래킹된 가격
  is_out_of_stock boolean default false,
  created_at timestamp with time zone default now()
);
```
