-- ツアー枠・管理者情報テーブル
-- 各ツアーの「運行日 / 時刻 / 上限枠（定員）/ 予約数 / 担当管理者情報 / 集合場所」を保持する。
-- 初期は手動登録、将来は OTA 連携で source='ota' を取り込む想定。
-- 予約・カレンダー画面で登録し、参加者名簿画面から相互参照する。
-- ユーザーごとに自分が登録したツアー枠のみ参照・編集できるよう RLS を設定する。

create extension if not exists "pgcrypto";

create table if not exists public.tours (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tour_date       date not null,
  name            text not null,
  start_time      text not null default '08:00',
  capacity        integer not null default 0,   -- 上限枠（定員）
  booked          integer not null default 0,   -- 予約数（初期は手動・将来 OTA 連携）
  manager         text,                          -- 担当管理者名
  manager_contact text,                          -- 担当管理者の連絡先
  meet            text,                          -- 集合場所
  note            text,
  source          text not null default 'manual' check (source in ('manual', 'ota')),
  created_at      timestamptz not null default now()
);

create index if not exists tours_user_id_idx on public.tours (user_id);
create index if not exists tours_tour_date_idx on public.tours (tour_date);

alter table public.tours enable row level security;

drop policy if exists "tours_select_own" on public.tours;
create policy "tours_select_own" on public.tours
  for select using (auth.uid() = user_id);

drop policy if exists "tours_insert_own" on public.tours;
create policy "tours_insert_own" on public.tours
  for insert with check (auth.uid() = user_id);

drop policy if exists "tours_update_own" on public.tours;
create policy "tours_update_own" on public.tours
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "tours_delete_own" on public.tours;
create policy "tours_delete_own" on public.tours
  for delete using (auth.uid() = user_id);
