-- チャット④: 未読数
-- ------------------------------------------------------------------
-- スレッドごとの未読数 = 自分の最終既読(chat_reads.last_read_at)より後に
-- 他人から届いたメッセージ数。既読行が無ければ全件（自分以外）が未読。
-- SECURITY INVOKER のため chat_messages の RLS が効き、
-- アクセスできるスレッドのみが集計対象になる。
-- ------------------------------------------------------------------

create or replace function public.chat_unread_counts()
returns table (thread_id uuid, unread bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select m.thread_id, count(*)::bigint as unread
  from public.chat_messages m
  left join public.chat_reads r
    on r.thread_id = m.thread_id and r.user_id = auth.uid()
  where m.sender_id <> auth.uid()
    and (r.last_read_at is null or m.created_at > r.last_read_at)
  group by m.thread_id
$$;

grant execute on function public.chat_unread_counts() to authenticated;
