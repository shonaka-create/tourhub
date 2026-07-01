-- オペレーションチャット（便グループ / メッセージ）
-- ------------------------------------------------------------------
-- v2要件のデータモデル。ステップ②では「便グループ(type='tour')」の送受信を実装する。
--   * データは組織(org)単位。RLS は auth_org_id() で束ねる。
--   * ステップ②時点では「同一orgのメンバーは自組織のスレッドを閲覧・投稿可」とする
--     （担当者限定への絞り込みはアサイン永続化後の後続ステップで対応）。
--   * DM(type='dm') / アナウンス(type='broadcast') の器も用意（送信制御は後続）。
-- ------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ── スレッド ─────────────────────────────────────────────────────
create table if not exists public.chat_threads (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null default public.auth_org_id() references public.organizations (id) on delete cascade,
  type       text not null default 'tour' check (type in ('tour', 'dm', 'broadcast')),
  title      text not null default '',
  tour_id    uuid references public.tours (id) on delete set null,
  status     text not null default 'active' check (status in ('active', 'archived')),
  archived_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists chat_threads_org_idx on public.chat_threads (org_id);
-- 1ツアー = 1便グループ
create unique index if not exists chat_threads_tour_uidx
  on public.chat_threads (tour_id) where tour_id is not null;

-- ── メンバー（tour/dm 用。broadcast は行を持たない）──────────────
create table if not exists public.chat_members (
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  user_id   uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

-- ── メッセージ ───────────────────────────────────────────────────
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null default public.auth_org_id() references public.organizations (id) on delete cascade,
  thread_id  uuid not null references public.chat_threads (id) on delete cascade,
  sender_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_thread_idx on public.chat_messages (thread_id, created_at);

-- ── 既読管理（未読数算出。ステップ④で使用）────────────────────────
create table if not exists public.chat_reads (
  thread_id    uuid not null references public.chat_threads (id) on delete cascade,
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);

-- ── アクセス判定ヘルパー（RLS 再帰回避のため SECURITY DEFINER）─────
create or replace function public.chat_can_access_thread(p_thread uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.chat_threads t
    where t.id = p_thread and t.org_id = public.auth_org_id()
  )
$$;

-- ── RLS ─────────────────────────────────────────────────────────
alter table public.chat_threads  enable row level security;
alter table public.chat_members  enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_reads    enable row level security;

-- threads: 自組織のスレッドを閲覧・作成・更新（アーカイブ）
drop policy if exists "chat_threads_select_org" on public.chat_threads;
create policy "chat_threads_select_org" on public.chat_threads
  for select using (org_id = public.auth_org_id());
drop policy if exists "chat_threads_insert_org" on public.chat_threads;
create policy "chat_threads_insert_org" on public.chat_threads
  for insert with check (org_id = public.auth_org_id());
drop policy if exists "chat_threads_update_org" on public.chat_threads;
create policy "chat_threads_update_org" on public.chat_threads
  for update using (org_id = public.auth_org_id()) with check (org_id = public.auth_org_id());

-- members: スレッドにアクセスできる人が閲覧・追加・削除
drop policy if exists "chat_members_select" on public.chat_members;
create policy "chat_members_select" on public.chat_members
  for select using (public.chat_can_access_thread(thread_id));
drop policy if exists "chat_members_insert" on public.chat_members;
create policy "chat_members_insert" on public.chat_members
  for insert with check (public.chat_can_access_thread(thread_id));
drop policy if exists "chat_members_delete" on public.chat_members;
create policy "chat_members_delete" on public.chat_members
  for delete using (public.chat_can_access_thread(thread_id));

-- messages: アクセス可能なスレッドを閲覧、自分名義でのみ投稿
drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select" on public.chat_messages
  for select using (public.chat_can_access_thread(thread_id));
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages
  for insert with check (
    public.chat_can_access_thread(thread_id) and sender_id = auth.uid()
  );

-- reads: 自分の既読のみ
drop policy if exists "chat_reads_all_own" on public.chat_reads;
create policy "chat_reads_all_own" on public.chat_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── Realtime 配信対象に追加（重複追加はエラーになるためガード）──────
do $$
begin
  begin
    alter publication supabase_realtime add table public.chat_messages;
  exception when duplicate_object then null;
  end;
end $$;
