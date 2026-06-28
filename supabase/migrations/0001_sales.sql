-- 売上登録（個別予約・現地販売）テーブル
-- ユーザーごとに自分の売上のみ参照・編集できるよう RLS を設定する。

create extension if not exists "pgcrypto";

create table if not exists public.sales (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  sale_date  date not null,
  tour       text not null,
  channel    text not null,
  booker     text,
  pax        integer not null default 1,
  amount     numeric not null default 0,
  pay        text not null default 'paid' check (pay in ('paid', 'due')),
  created_at timestamptz not null default now()
);

create index if not exists sales_user_id_idx on public.sales (user_id);
create index if not exists sales_sale_date_idx on public.sales (sale_date);

alter table public.sales enable row level security;

drop policy if exists "sales_select_own" on public.sales;
create policy "sales_select_own" on public.sales
  for select using (auth.uid() = user_id);

drop policy if exists "sales_insert_own" on public.sales;
create policy "sales_insert_own" on public.sales
  for insert with check (auth.uid() = user_id);

drop policy if exists "sales_update_own" on public.sales;
create policy "sales_update_own" on public.sales
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sales_delete_own" on public.sales;
create policy "sales_delete_own" on public.sales
  for delete using (auth.uid() = user_id);
