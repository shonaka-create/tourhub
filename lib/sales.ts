import { createClient } from "@/lib/supabase/client";

// 売上登録（個別予約・現地販売）1件
export interface SaleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  tour: string;
  channel: string;
  booker: string;
  pax: number;
  amount: number;
  pay: "paid" | "due";
}

// Supabase の sales 行 → アプリ内の SaleEntry へ変換
function fromRow(r: any): SaleEntry {
  return {
    id: r.id,
    date: r.sale_date,
    tour: r.tour,
    channel: r.channel,
    booker: r.booker ?? "",
    pax: Number(r.pax) || 1,
    amount: Number(r.amount) || 0,
    pay: r.pay === "due" ? "due" : "paid",
  };
}

export async function fetchSales(): Promise<SaleEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(fromRow);
}

export async function insertSale(e: Omit<SaleEntry, "id">): Promise<SaleEntry> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sales")
    .insert({
      sale_date: e.date,
      tour: e.tour,
      channel: e.channel,
      booker: e.booker,
      pax: e.pax,
      amount: e.amount,
      pay: e.pay,
    })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteSale(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) throw error;
}
