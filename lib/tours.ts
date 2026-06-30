import { createClient } from "@/lib/supabase/client";

// ツアー枠・管理者情報 1件
// 予約・カレンダー画面で登録し、参加者名簿画面から相互参照する。
export interface TourSlot {
  id: string;
  date: string; // YYYY-MM-DD（運行日）
  name: string; // ツアー名
  time: string; // 開始時刻 HH:MM
  capacity: number; // 上限枠（定員）
  booked: number; // 予約数（初期は手動・将来 OTA 連携）
  manager: string; // 担当管理者名
  contact: string; // 担当管理者の連絡先
  meet: string; // 集合場所
  note: string;
  source: "manual" | "ota"; // 登録経路
}

// Supabase の tours 行 → アプリ内の TourSlot へ変換
function fromRow(r: any): TourSlot {
  return {
    id: r.id,
    date: r.tour_date,
    name: r.name,
    time: r.start_time ?? "08:00",
    capacity: Number(r.capacity) || 0,
    booked: Number(r.booked) || 0,
    manager: r.manager ?? "",
    contact: r.manager_contact ?? "",
    meet: r.meet ?? "",
    note: r.note ?? "",
    source: r.source === "ota" ? "ota" : "manual",
  };
}

function toRow(e: Omit<TourSlot, "id">) {
  return {
    tour_date: e.date,
    name: e.name,
    start_time: e.time,
    capacity: e.capacity,
    booked: e.booked,
    manager: e.manager,
    manager_contact: e.contact,
    meet: e.meet,
    note: e.note,
    source: e.source,
  };
}

export async function fetchTours(): Promise<TourSlot[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .order("tour_date", { ascending: true })
    .order("start_time", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function insertTour(e: Omit<TourSlot, "id">): Promise<TourSlot> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tours")
    .insert(toRow(e))
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTour(
  id: string,
  e: Omit<TourSlot, "id">
): Promise<TourSlot> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tours")
    .update(toRow(e))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteTour(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tours").delete().eq("id", id);
  if (error) throw error;
}
