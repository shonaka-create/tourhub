"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";
import { SaleEntry, fetchSales, insertSale, deleteSale } from "@/lib/sales";

// 直近7日の売上（当週）と前週同曜日
const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const THIS_WEEK = [6200, 5800, 6900, 7400, 8100, 9600, 8420];
const LAST_WEEK = [5400, 5600, 6100, 6800, 7200, 8800, 7500];

interface ChannelRow {
  label: string;
  count: number;
  amount: number;
  prev: number;
  color: string;
}

const CHANNELS: ChannelRow[] = [
  { label: "自社サイト", count: 42, amount: 3870, prev: 3360, color: C.blue },
  { label: "提携ホテル", count: 28, amount: 2610, prev: 2480, color: C.teal },
  { label: "OTA / 代理店", count: 19, amount: 1940, prev: 1810, color: C.mint },
];

const RANGES = ["本日", "今週", "今月"] as const;

const TOUR_OPTIONS = [
  "モーニング・スノーケル",
  "パラセーリング",
  "ジェットスキー体験",
  "シティ・バイクツアー",
  "サンライズ・SUP",
];
const CHANNEL_OPTIONS = ["自社サイト", "提携ホテル", "OTA / 代理店", "ウォークイン", "電話・直接"];

export function SalesModule() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("今週");
  const [entries, setEntries] = useState<SaleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    date: "2026-06-28",
    tour: TOUR_OPTIONS[0],
    channel: CHANNEL_OPTIONS[0],
    booker: "",
    pax: "1",
    amount: "",
    pay: "paid" as "paid" | "due",
  });

  // 初回ロード: Supabase から保存済みの売上を取得
  useEffect(() => {
    let active = true;
    fetchSales()
      .then((rows) => {
        if (active) setEntries(rows);
      })
      .catch((e) => {
        if (active) setErr(e?.message ?? "売上データの読み込みに失敗しました");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function addEntry() {
    const amt = Number(form.amount);
    if (!amt || saving) return;
    setSaving(true);
    setErr(null);
    try {
      const saved = await insertSale({
        date: form.date,
        tour: form.tour,
        channel: form.channel,
        booker: form.booker.trim() || "（名称未入力）",
        pax: Number(form.pax) || 1,
        amount: amt,
        pay: form.pay,
      });
      setEntries((prev) => [saved, ...prev]);
      setForm({ ...form, booker: "", pax: "1", amount: "", pay: "paid" });
      setAdding(false);
    } catch (e: any) {
      setErr(e?.message ?? "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function removeEntry(id: string) {
    const prev = entries;
    setEntries((cur) => cur.filter((e) => e.id !== id)); // 楽観的に削除
    try {
      await deleteSale(id);
    } catch (e: any) {
      setEntries(prev); // 失敗時はロールバック
      setErr(e?.message ?? "削除に失敗しました");
    }
  }

  // 手動登録分の集計
  const regTotal = entries.reduce((a, e) => a + e.amount, 0);
  const regDueTotal = entries.filter((e) => e.pay === "due").reduce((a, e) => a + e.amount, 0);
  const regDueCount = entries.filter((e) => e.pay === "due").length;

  const thisTotal = THIS_WEEK.reduce((a, b) => a + b, 0) + regTotal;
  const lastTotal = LAST_WEEK.reduce((a, b) => a + b, 0);
  const wow = Math.round(((thisTotal - lastTotal) / lastTotal) * 100);

  const today = THIS_WEEK[THIS_WEEK.length - 1] + regTotal;
  const todayPrev = LAST_WEEK[LAST_WEEK.length - 1];
  const todayWow = Math.round(((today - todayPrev) / todayPrev) * 100);

  const chTotal = CHANNELS.reduce((a, c) => a + c.amount, 0);
  // 当週グラフ: 本日（日）に手動登録分を加算して反映
  const thisWeekChart = THIS_WEEK.map((v, i) => (i === THIS_WEEK.length - 1 ? v + regTotal : v));
  const max = Math.max(...thisWeekChart, ...LAST_WEEK);

  const headline =
    range === "本日" ? today : range === "今週" ? thisTotal : Math.round(thisTotal * 4.3);
  const headlineWow = range === "本日" ? todayWow : wow;

  const baseBookings = CHANNELS.reduce((a, c) => a + c.count, 0);
  const baseDue = 640;
  const baseDueCount = 3;

  const kpis = [
    {
      k: range + "の売上",
      v: "$" + headline.toLocaleString(),
      d: (headlineWow >= 0 ? "▲ " : "▼ ") + Math.abs(headlineWow) + "% 前週比",
      c: headlineWow >= 0 ? C.green : C.red,
    },
    { k: "客単価", v: "$" + Math.round(today / (24 + entries.length || 1)), d: "本日 " + (24 + entries.length) + "組", c: C.sub },
    { k: "予約件数", v: baseBookings + entries.length + "件", d: entries.length ? "うち手動登録 " + entries.length + "件" : "確定ベース", c: C.sub },
    { k: "未収金", v: "$" + (baseDue + regDueTotal).toLocaleString(), d: baseDueCount + regDueCount + "件 要回収", c: C.amber },
  ];

  const inputStyle = sx(
    "box-sizing:border-box;width:100%;border:1px solid " +
      C.line +
      ";border-radius:10px;padding:9px 11px;font-family:inherit;font-size:13px;color:" +
      C.ink +
      ";outline:none"
  );

  return (
    <div style={sx("display:flex;flex-direction:column;gap:18px")}>
      {/* SALES REGISTRATION */}
      <section style={sx(card + "padding:18px 20px")}>
        <div className="r-head" style={sx("display:flex;align-items:center;justify-content:space-between")}>
          <div>
            <div style={sx(h2)}>売上登録（個別予約・現地販売）</div>
            <div style={sx(label + "margin-top:3px")}>
              OTA以外の電話・直接・ウォークイン予約をその場で登録。下のKPI・グラフに即反映されます
            </div>
          </div>
          <button
            onClick={() => setAdding((v) => !v)}
            style={sx(btn(adding ? C.soft : C.blue, adding ? C.sub : "#fff") + "display:flex;align-items:center;gap:7px")}
          >
            {adding ? (
              "閉じる"
            ) : (
              <>
                <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
                売上を登録
              </>
            )}
          </button>
        </div>

        {adding ? (
          <div
            className="r-form"
            style={sx(
              "background:#F2FAFE;border:1.5px solid #CFE7F4;border-radius:14px;padding:16px;margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px"
            )}
          >
            <div>
              <div style={sx(label + "margin-bottom:5px")}>日付</div>
              <input style={inputStyle} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>ツアー</div>
              <select style={inputStyle} value={form.tour} onChange={(e) => setForm({ ...form, tour: e.target.value })}>
                {TOUR_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>チャネル</div>
              <select style={inputStyle} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                {CHANNEL_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>予約者名</div>
              <input style={inputStyle} value={form.booker} onChange={(e) => setForm({ ...form, booker: e.target.value })} placeholder="例: 田中 様" />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>人数</div>
              <input style={inputStyle} type="number" min={1} value={form.pax} onChange={(e) => setForm({ ...form, pax: e.target.value })} />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>金額（$）*</div>
              <input style={inputStyle} type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>決済状況</div>
              <select style={inputStyle} value={form.pay} onChange={(e) => setForm({ ...form, pay: e.target.value as "paid" | "due" })}>
                <option value="paid">入金済</option>
                <option value="due">未収</option>
              </select>
            </div>
            <div style={sx("display:flex;align-items:flex-end")}>
              <button
                onClick={addEntry}
                disabled={saving}
                style={sx(btn(C.green, "#fff") + "width:100%" + (saving ? ";opacity:.6;cursor:wait" : ""))}
              >
                {saving ? "保存中…" : "登録する"}
              </button>
            </div>
          </div>
        ) : null}

        {err ? (
          <div
            style={sx(
              "margin-top:12px;background:#FDEBEB;border:1px solid #F3D2D2;border-radius:10px;padding:10px 13px;font-size:12px;color:" +
                C.red
            )}
          >
            {err}（Supabase の sales テーブル / ログイン状態をご確認ください）
          </div>
        ) : null}

        {entries.length ? (
          <div className="r-scroll" style={sx("margin-top:16px")}>
            <div className="r-twwrap">
            <div
              style={sx(
                "display:grid;grid-template-columns:1fr 1.4fr 1.2fr 1.4fr .7fr 1fr .9fr 30px;gap:10px;padding:0 12px 9px;font-size:11px;font-weight:700;color:" +
                  C.sub
              )}
            >
              <div>日付</div>
              <div>ツアー</div>
              <div>チャネル</div>
              <div>予約者名</div>
              <div style={sx("text-align:center")}>人数</div>
              <div style={sx("text-align:right")}>金額</div>
              <div style={sx("text-align:center")}>決済</div>
              <div />
            </div>
            {entries.map((e) => (
              <div
                key={e.id}
                style={sx(
                  "display:grid;grid-template-columns:1fr 1.4fr 1.2fr 1.4fr .7fr 1fr .9fr 30px;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid #F0F5F8"
                )}
              >
                <div style={sx("font-size:12px;color:" + C.sub)}>{e.date.slice(5)}</div>
                <div style={sx("font-size:13px;font-weight:700")}>{e.tour}</div>
                <div style={sx("font-size:12px")}>{e.channel}</div>
                <div style={sx("font-size:12px")}>{e.booker}</div>
                <div className="font-outfit" style={sx("text-align:center;font-weight:700")}>{e.pax}</div>
                <div className="font-outfit" style={sx("text-align:right;font-weight:800;font-size:14px")}>
                  ${e.amount.toLocaleString()}
                </div>
                <div style={sx("text-align:center")}>
                  <Html
                    html={
                      e.pay === "due"
                        ? pill("未収", C.red, "#FDEBEB")
                        : pill("入金済", C.green, "#E4F6EC")
                    }
                  />
                </div>
                <div
                  onClick={() => removeEntry(e.id)}
                  title="削除"
                  style={sx("cursor:pointer;display:flex;align-items:center;justify-content:center")}
                >
                  <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5h6v2M7 7l1 13h8l1-13" stroke="#9DB4C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                </div>
              </div>
            ))}
            <div
              style={sx(
                "display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-top:8px;padding:11px 14px;background:#F2FAFE;border-radius:12px"
              )}
            >
              <span style={sx("font-size:13px;font-weight:700;color:" + C.deep)}>登録済み売上 合計（{entries.length}件）</span>
              <span className="font-outfit" style={sx("font-weight:800;font-size:20px;color:" + C.green)}>
                ${regTotal.toLocaleString()}
              </span>
            </div>
            </div>
          </div>
        ) : (
          <div
            style={sx(
              "margin-top:14px;border:1.5px dashed #C9DCE8;border-radius:12px;padding:18px;text-align:center;font-size:12px;color:#9DB4C4"
            )}
          >
            {loading
              ? "Supabase から売上データを読み込み中…"
              : "まだ登録された売上はありません。「売上を登録」から個別予約・現地販売を追加してください。"}
          </div>
        )}
      </section>

      {/* RANGE SWITCHER */}
      <div style={sx("display:flex;gap:9px")}>
        {RANGES.map((r) => {
          const on = r === range;
          return (
            <div
              key={r}
              onClick={() => setRange(r)}
              style={sx(
                "padding:9px 18px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;" +
                  (on ? "background:" + C.blue + ";color:#fff" : "background:" + C.soft + ";color:" + C.sub)
              )}
            >
              {r}
            </div>
          );
        })}
      </div>

      {/* KPI STRIP */}
      <div className="r-grid-4" style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:14px")}>
        {kpis.map((k, i) => (
          <div key={i} style={sx(card + "padding:16px 18px")}>
            <div style={sx(label)}>{k.k}</div>
            <div className="font-outfit" style={sx("font-weight:800;font-size:26px;margin-top:8px")}>
              {k.v}
            </div>
            <div style={sx("font-size:12px;font-weight:700;margin-top:3px;color:" + k.c)}>{k.d}</div>
          </div>
        ))}
      </div>

      <div className="r-split" style={sx("display:grid;grid-template-columns:1.5fr 1fr;gap:18px;align-items:start")}>
        {/* WoW BAR CHART */}
        <section style={sx(card + "padding:18px 22px")}>
          <div style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:4px")}>
            <div style={sx(h2)}>当週 vs 前週（前週比トレンド）</div>
            <Html
              html={pill(
                (wow >= 0 ? "▲ " : "▼ ") + Math.abs(wow) + "% 週合計",
                wow >= 0 ? C.green : C.red,
                wow >= 0 ? "#E4F6EC" : "#FDEBEB"
              )}
            />
          </div>
          <div style={sx(label + "margin-bottom:18px")}>
            当週 ${thisTotal.toLocaleString()} ・ 前週 ${lastTotal.toLocaleString()}
          </div>
          <div style={sx("display:flex;align-items:flex-end;gap:14px;height:200px")}>
            {DAYS.map((d, i) => {
              const th = (thisWeekChart[i] / max) * 100;
              const lh = (LAST_WEEK[i] / max) * 100;
              const up = thisWeekChart[i] >= LAST_WEEK[i];
              return (
                <div key={d} style={sx("flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%")}>
                  <div style={sx("flex:1;display:flex;align-items:flex-end;gap:4px;width:100%;justify-content:center")}>
                    <div
                      title={"前週 $" + LAST_WEEK[i]}
                      style={{
                        ...sx("width:13px;background:#D5E3EC;border-radius:5px 5px 0 0"),
                        height: lh + "%",
                      }}
                    />
                    <div
                      title={"当週 $" + thisWeekChart[i]}
                      style={{
                        ...sx("width:13px;border-radius:5px 5px 0 0;background:" + (up ? C.blue : C.amber)),
                        height: th + "%",
                      }}
                    />
                  </div>
                  <div style={sx("font-size:11px;color:" + C.sub + ";font-weight:600")}>{d}</div>
                </div>
              );
            })}
          </div>
          <div style={sx("display:flex;gap:18px;margin-top:14px;font-size:11px;color:" + C.sub)}>
            <span style={sx("display:flex;align-items:center;gap:5px")}>
              <span style={sx("width:10px;height:10px;border-radius:3px;background:" + C.blue)} />当週
            </span>
            <span style={sx("display:flex;align-items:center;gap:5px")}>
              <span style={sx("width:10px;height:10px;border-radius:3px;background:#D5E3EC")} />前週
            </span>
          </div>
        </section>

        {/* CHANNEL BREAKDOWN */}
        <section style={sx(card + "padding:18px 20px")}>
          <div style={sx(h2 + "margin-bottom:3px")}>チャネル別売上</div>
          <div style={sx(label + "margin-bottom:14px")}>本日着地（見込）${chTotal.toLocaleString()}</div>
          <div style={sx("display:flex;height:14px;border-radius:8px;overflow:hidden;margin-bottom:16px;gap:2px")}>
            {CHANNELS.map((c, i) => (
              <div key={i} style={{ ...sx("background:" + c.color), width: (c.amount / chTotal) * 100 + "%" }} />
            ))}
          </div>
          <div style={sx("display:flex;flex-direction:column;gap:13px")}>
            {CHANNELS.map((c, i) => {
              const cw = Math.round(((c.amount - c.prev) / c.prev) * 100);
              return (
                <div key={i} style={sx("display:flex;align-items:center;gap:10px")}>
                  <span style={sx("width:10px;height:10px;border-radius:3px;background:" + c.color)} />
                  <div style={sx("flex:1")}>
                    <div style={sx("font-size:13px;font-weight:700")}>{c.label}</div>
                    <div style={sx("font-size:11px;color:" + C.sub)}>{c.count}件</div>
                  </div>
                  <div style={sx("text-align:right")}>
                    <div className="font-outfit" style={sx("font-weight:700;font-size:14px")}>
                      ${c.amount.toLocaleString()}
                    </div>
                    <div style={sx("font-size:11px;font-weight:700;color:" + (cw >= 0 ? C.green : C.red))}>
                      {(cw >= 0 ? "▲ " : "▼ ") + Math.abs(cw) + "%"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={sx(
              "margin-top:16px;background:#F2FAFE;border-radius:12px;padding:11px 14px;font-size:12px;color:" +
                C.deep +
                ";display:flex;align-items:center;gap:8px"
            )}
          >
            <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#0A5688" stroke-width="2"/><path d="M12 7v5l3 2" stroke="#0A5688" stroke-width="2" stroke-linecap="round"/></svg>' />
            <span>
              未収金 <b>$640</b>（3件）・ 代理店回収予定 <b>$1,180</b>
            </span>
          </div>
        </section>
      </div>

      {/* TOUR PROFITABILITY */}
      <section style={sx(card + "padding:18px 20px")}>
        <div style={sx(h2 + "margin-bottom:14px")}>ツアー別 売上ランキング（今週）</div>
        {[
          { n: "モーニング・スノーケル", rev: 4820, share: 100, pax: 96 },
          { n: "パラセーリング", rev: 3960, share: 82, pax: 54 },
          { n: "ジェットスキー体験", rev: 3240, share: 67, pax: 48 },
          { n: "シティ・バイクツアー", rev: 2180, share: 45, pax: 70 },
          { n: "サンライズ・SUP", rev: 1560, share: 32, pax: 40 },
        ].map((t, i) => (
          <div key={i} style={sx("display:flex;align-items:center;gap:14px;padding:11px 4px;border-bottom:1px solid #F0F5F8")}>
            <div
              className="font-outfit"
              style={sx(
                "width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:#fff;background:" +
                  (i === 0 ? C.blue : "#9DB4C4")
              )}
            >
              {i + 1}
            </div>
            <div style={sx("flex:1;font-size:13px;font-weight:700")}>{t.n}</div>
            <div style={sx("width:140px;height:8px;background:#EAF0F5;border-radius:5px;overflow:hidden")}>
              <div style={{ ...sx("height:100%;border-radius:5px;background:" + C.blue), width: t.share + "%" }} />
            </div>
            <div style={sx("font-size:12px;color:" + C.sub + ";width:60px;text-align:right")}>{t.pax}名</div>
            <div className="font-outfit" style={sx("font-weight:800;font-size:15px;width:72px;text-align:right")}>
              ${t.rev.toLocaleString()}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
