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
