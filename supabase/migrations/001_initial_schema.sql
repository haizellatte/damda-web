-- ============================================================
-- 담다 초기 스키마 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행하세요.
-- ============================================================

-- ─── 1. 테이블 생성 ──────────────────────────────────────────

-- Profiles: 사용자 추가 정보
create table if not exists public.profiles (
  id         uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url   text,
  updated_at   timestamp with time zone default now()
);

-- Categories: 유저별 카테고리 (Phase 2)
create table if not exists public.categories (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  name       text not null,
  created_at timestamp with time zone default now()
);

-- Products: 장바구니 상품
create table if not exists public.products (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid references auth.users on delete cascade not null,
  category_id      uuid references public.categories on delete set null,
  url              text not null,
  title            text not null,
  image_url        text,
  mall_name        text,
  base_price       numeric,
  current_price    numeric,
  is_out_of_stock  boolean default false,
  created_at       timestamp with time zone default now()
);

-- ─── 2. RLS 활성화 ───────────────────────────────────────────

alter table public.profiles  enable row level security;
alter table public.categories enable row level security;
alter table public.products   enable row level security;

-- ─── 3. RLS 정책 — profiles ──────────────────────────────────

create policy "본인 프로필 조회" on public.profiles
  for select using (auth.uid() = id);

create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

-- ─── 4. RLS 정책 — categories ────────────────────────────────

create policy "본인 카테고리 조회" on public.categories
  for select using (auth.uid() = user_id);

create policy "본인 카테고리 생성" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "본인 카테고리 수정" on public.categories
  for update using (auth.uid() = user_id);

create policy "본인 카테고리 삭제" on public.categories
  for delete using (auth.uid() = user_id);

-- ─── 5. RLS 정책 — products ──────────────────────────────────

create policy "본인 상품 조회" on public.products
  for select using (auth.uid() = user_id);

create policy "본인 상품 생성" on public.products
  for insert with check (auth.uid() = user_id);

create policy "본인 상품 수정" on public.products
  for update using (auth.uid() = user_id);

create policy "본인 상품 삭제" on public.products
  for delete using (auth.uid() = user_id);

-- ─── 6. 신규 유저 가입 시 profiles 자동 생성 트리거 ───────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
