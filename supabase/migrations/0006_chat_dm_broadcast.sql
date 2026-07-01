-- チャット③: 1:1 DM ／ 全体アナウンス
-- ------------------------------------------------------------------
-- ステップ②は「便グループ = org内公開」だったが、DM は当事者のみ・
-- アナウンスは本部(owner)のみ投稿、という制御を追加する。
--   * type='tour'      … org内公開（従来どおり）
--   * type='dm'        … chat_members に居る当事者のみ閲覧・投稿
--   * type='broadcast' … org内公開で閲覧、投稿は owner のみ。組織に1つ（singleton）
-- ------------------------------------------------------------------

-- 組織あたり全体アナウンスは1つ
create unique index if not exists chat_threads_broadcast_uidx
  on public.chat_threads (org_id) where type = 'broadcast';

-- アクセス判定: dm は当事者(chat_members)のみ、他は org 内
create or replace function public.chat_can_access_thread(p_thread uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.chat_threads t
    where t.id = p_thread
      and t.org_id = public.auth_org_id()
      and (
        t.type <> 'dm'
        or exists (
          select 1 from public.chat_members m
          where m.thread_id = t.id and m.user_id = auth.uid()
        )
      )
  )
$$;

-- threads の閲覧: dm は当事者のみ一覧に出す
drop policy if exists "chat_threads_select_org" on public.chat_threads;
create policy "chat_threads_select_org" on public.chat_threads
  for select using (
    org_id = public.auth_org_id()
    and (
      type <> 'dm'
      or exists (
        select 1 from public.chat_members m
        where m.thread_id = id and m.user_id = auth.uid()
      )
    )
  );

-- members の追加: スレッド作成者 or オーナーが追加できる（DM作成時の初期メンバー投入用）
drop policy if exists "chat_members_insert" on public.chat_members;
create policy "chat_members_insert" on public.chat_members
  for insert with check (
    exists (
      select 1 from public.chat_threads t
      where t.id = thread_id
        and t.org_id = public.auth_org_id()
        and (t.created_by = auth.uid() or public.auth_is_owner())
    )
  );

-- messages の投稿: broadcast は owner のみ（他は従来どおりアクセス可能なら投稿可）
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages
  for insert with check (
    public.chat_can_access_thread(thread_id)
    and sender_id = auth.uid()
    and (
      not exists (
        select 1 from public.chat_threads t
        where t.id = thread_id and t.type = 'broadcast'
      )
      or public.auth_is_owner()
    )
  );
