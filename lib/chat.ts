import { createClient } from "@/lib/supabase/client";

export type ThreadType = "tour" | "dm" | "broadcast";

export interface ChatThread {
  id: string;
  type: ThreadType;
  title: string;
  tourId: string | null;
  status: "active" | "archived";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

function threadFromRow(r: any): ChatThread {
  return {
    id: r.id,
    type: r.type === "dm" || r.type === "broadcast" ? r.type : "tour",
    title: r.title ?? "",
    tourId: r.tour_id ?? null,
    status: r.status === "archived" ? "archived" : "active",
    createdAt: r.created_at,
  };
}

function messageFromRow(r: any): ChatMessage {
  return {
    id: r.id,
    threadId: r.thread_id,
    senderId: r.sender_id,
    body: r.body ?? "",
    createdAt: r.created_at,
  };
}

// 自組織のスレッド一覧（RLS で org 内のみ返る）
export async function fetchThreads(): Promise<ChatThread[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_threads")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(threadFromRow);
}

// ツアーに紐づく便グループを取得（無ければ作成）。1ツアー=1スレッド。
export async function ensureTourThread(
  tourId: string,
  title: string
): Promise<ChatThread> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("tour_id", tourId)
    .maybeSingle();
  if (existing) return threadFromRow(existing);

  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ type: "tour", title, tour_id: tourId })
    .select()
    .single();
  // 競合で unique 制約に当たったら取得し直す
  if (error) {
    const { data: again, error: e2 } = await supabase
      .from("chat_threads")
      .select("*")
      .eq("tour_id", tourId)
      .single();
    if (e2) throw error;
    return threadFromRow(again);
  }
  return threadFromRow(data);
}

// 組織の全体アナウンススレッド（無ければ作成・org に1つ）
export async function ensureBroadcastThread(): Promise<ChatThread> {
  const supabase = createClient();
  const { data: existing } = await supabase
    .from("chat_threads")
    .select("*")
    .eq("type", "broadcast")
    .maybeSingle();
  if (existing) return threadFromRow(existing);

  const { data, error } = await supabase
    .from("chat_threads")
    .insert({ type: "broadcast", title: "全体アナウンス" })
    .select()
    .single();
  if (error) {
    const { data: again, error: e2 } = await supabase
      .from("chat_threads")
      .select("*")
      .eq("type", "broadcast")
      .single();
    if (e2) throw error;
    return threadFromRow(again);
  }
  return threadFromRow(data);
}

// 自分がアクセスできるスレッドのメンバー(thread_id, user_id)一覧。
// DMの相手表示や便グループの参加者表示に使う。
export async function fetchMyThreadMembers(): Promise<
  { threadId: string; userId: string }[]
> {
  const supabase = createClient();
  const { data, error } = await supabase.from("chat_members").select("thread_id,user_id");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ threadId: r.thread_id, userId: r.user_id }));
}

// 指定メンバーとの1:1 DM（無ければ作成）。当事者2名を chat_members に登録。
export async function startDm(
  otherUserId: string,
  otherName: string
): Promise<ChatThread> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user?.id;
  if (!me) throw new Error("未ログインです");

  // 既存DMを探す: 自分の所属スレッドと相手の所属スレッドの共通 dm を再利用
  const members = await fetchMyThreadMembers();
  const mine = new Set(members.filter((m) => m.userId === me).map((m) => m.threadId));
  const shared = members.filter((m) => m.userId === otherUserId && mine.has(m.threadId));
  if (shared.length) {
    const ids = shared.map((s) => s.threadId);
    const { data: dm } = await supabase
      .from("chat_threads")
      .select("*")
      .in("id", ids)
      .eq("type", "dm")
      .limit(1)
      .maybeSingle();
    if (dm) return threadFromRow(dm);
  }

  // 無ければ作成し、当事者2名を登録
  const { data: created, error } = await supabase
    .from("chat_threads")
    .insert({ type: "dm", title: otherName })
    .select()
    .single();
  if (error) throw error;
  const thread = threadFromRow(created);
  const { error: mErr } = await supabase.from("chat_members").insert([
    { thread_id: thread.id, user_id: me },
    { thread_id: thread.id, user_id: otherUserId },
  ]);
  if (mErr) throw mErr;
  return thread;
}

export async function fetchMessages(threadId: string): Promise<ChatMessage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(messageFromRow);
}

export async function sendMessage(
  threadId: string,
  body: string
): Promise<ChatMessage> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ thread_id: threadId, body })
    .select()
    .single();
  if (error) throw error;
  return messageFromRow(data);
}

// スレッドを既読にする（自分の last_read_at を now で更新）。
export async function markRead(threadId: string): Promise<void> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("chat_reads").upsert(
    { thread_id: threadId, user_id: auth.user.id, last_read_at: new Date().toISOString() },
    { onConflict: "thread_id,user_id" }
  );
}

// スレッドごとの未読数（thread_id -> 件数）。
export async function fetchUnreadCounts(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("chat_unread_counts");
  if (error) throw error;
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as any[]) out[r.thread_id] = Number(r.unread) || 0;
  return out;
}

// 全メッセージのINSERTを購読（未読の再集計トリガー用）。payloadは信用せず件数はRLS越しに再取得する。
export function subscribeAllMessages(onInsert: () => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel("chat:all")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages" },
      () => onInsert()
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

// スレッドの新着メッセージを購読。返り値の関数で解除する。
export function subscribeMessages(
  threadId: string,
  onInsert: (m: ChatMessage) => void
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel("chat:" + threadId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: "thread_id=eq." + threadId,
      },
      (payload) => onInsert(messageFromRow(payload.new))
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
