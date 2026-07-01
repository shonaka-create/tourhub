"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";
import { TransferPanel } from "./RouteModule";
import { TourSlot, fetchTours } from "@/lib/tours";

// 本日の運行日（Topbar と同じ表記に統一）
const TOUR_DATE = "2026年6月28日 (日)";
const TOUR_DATE_ISO = "2026-06-28"; // 予約・カレンダーで登録したツアー枠の照合キー

interface Booking {
  id: string;
  booker: string; // 予約者名
  bk: string; // 予約番号
  ch: string; // チャネル
  pay: "paid" | "due";
  due: number;
  note: string;
  participants: { id: string; name: string }[]; // 参加者名（1予約:N名）
}

const TOURS = [
  { id: "m1", name: "モーニング・スノーケル", time: "08:00", guide: "K. Lee", van: "バン #2", meet: "Cavill Ave 桟橋", route: "スノーケル" },
  { id: "m2", name: "パラセーリング 第1便", time: "09:30", guide: "M. Tan", van: "バン #4", meet: "Marina Mirage", route: "パラセーリング" },
  { id: "m3", name: "ジェットスキー体験", time: "11:00", guide: "J. Park", van: "バン #7", meet: "Mariners Cove", route: "ジェットスキー" },
];

const DATASET: Record<string, Booking[]> = {
  m1: [
    { id: "m1a", booker: "Emma Wilson", bk: "GC-2284", ch: "自社サイト", pay: "paid", due: 0, note: "甲殻類アレルギー", participants: [{ id: "m1a1", name: "Emma Wilson" }, { id: "m1a2", name: "Jack Wilson" }] },
    { id: "m1b", booker: "Liam Chen", bk: "GC-2287", ch: "Hilton", pay: "paid", due: 0, note: "", participants: [{ id: "m1b1", name: "Liam Chen" }] },
    { id: "m1c", booker: "Sophie Martin", bk: "GC-2291", ch: "Experience Oz", pay: "due", due: 80, note: "バウチャー未精算", participants: [{ id: "m1c1", name: "Sophie Martin" }, { id: "m1c2", name: "Paul Martin" }] },
    { id: "m1d", booker: "佐藤 健司（団体）", bk: "GC-2293", ch: "自社サイト", pay: "paid", due: 0, note: "写真撮影希望", participants: [{ id: "m1d1", name: "佐藤 健司" }, { id: "m1d2", name: "佐藤 美咲" }, { id: "m1d3", name: "佐藤 蓮" }, { id: "m1d4", name: "佐藤 葵" }] },
    { id: "m1e", booker: "David Cole", bk: "GC-2298", ch: "Marriott", pay: "paid", due: 0, note: "", participants: [{ id: "m1e1", name: "David Cole" }, { id: "m1e2", name: "Anna Cole" }] },
    { id: "m1f", booker: "Walk-in（現地）", bk: "—", ch: "ウォークイン", pay: "due", due: 90, note: "現金未収", participants: [{ id: "m1f1", name: "Walk-in 1" }, { id: "m1f2", name: "Walk-in 2" }] },
  ],
  m2: [
    { id: "m2a", booker: "Olivia Brown", bk: "GC-2301", ch: "Viator", pay: "paid", due: 0, note: "", participants: [{ id: "m2a1", name: "Olivia Brown" }, { id: "m2a2", name: "Noah Brown" }] },
    { id: "m2b", booker: "田中 寛（団体）", bk: "GC-2305", ch: "自社サイト", pay: "paid", due: 0, note: "高所恐怖症の同伴者あり", participants: [{ id: "m2b1", name: "田中 寛" }, { id: "m2b2", name: "田中 由美" }, { id: "m2b3", name: "田中 太一" }] },
    { id: "m2c", booker: "Marco Rossi", bk: "GC-2309", ch: "Q1 Resort", pay: "due", due: 120, note: "バウチャー未精算", participants: [{ id: "m2c1", name: "Marco Rossi" }, { id: "m2c2", name: "Giulia Rossi" }] },
    { id: "m2d", booker: "Grace Kim", bk: "GC-2312", ch: "自社サイト", pay: "paid", due: 0, note: "", participants: [{ id: "m2d1", name: "Grace Kim" }] },
  ],
  m3: [
    { id: "m3a", booker: "James Wilson", bk: "GC-2320", ch: "Experience Oz", pay: "paid", due: 0, note: "", participants: [{ id: "m3a1", name: "James Wilson" }, { id: "m3a2", name: "Kate Wilson" }] },
    { id: "m3b", booker: "Mei Lin", bk: "GC-2322", ch: "Peppers", pay: "paid", due: 0, note: "初心者", participants: [{ id: "m3b1", name: "Mei Lin" }, { id: "m3b2", name: "Wei Lin" }] },
    { id: "m3c", booker: "Tom Baker", bk: "GC-2325", ch: "自社サイト", pay: "due", due: 60, note: "残金 現地払い", participants: [{ id: "m3c1", name: "Tom Baker" }] },
    { id: "m3d", booker: "森 由紀", bk: "GC-2327", ch: "自社サイト", pay: "paid", due: 0, note: "", participants: [{ id: "m3d1", name: "森 由紀" }] },
  ],
};

export function ManifestModule() {
  const [sop, setSop] = useState({ life: false, brief: false, weather: false });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [started, setStarted] = useState<Record<string, boolean>>({});
  const [sos, setSos] = useState(false);
  const [reminded, setReminded] = useState(false);
  const [tid, setTid] = useState("m1");
  const [view, setView] = useState<"roster" | "transfer">("roster");
  // 当日未収の回収状況（予約ID単位）
  const [collected, setCollected] = useState<Record<string, boolean>>({});
  // 予約・カレンダーで登録されたツアー枠（Supabase から相互参照）
  const [regTours, setRegTours] = useState<TourSlot[]>([]);

  useEffect(() => {
    let active = true;
    fetchTours()
      .then((rows) => {
        if (active) setRegTours(rows.filter((t) => t.date === TOUR_DATE_ISO));
      })
      .catch(() => {
        /* 未ログイン・テーブル未作成時は参照パネルを表示しないだけ */
      });
    return () => {
      active = false;
    };
  }, []);

  const tour = TOURS.find((t) => t.id === tid)!;
  const bookings = DATASET[tid];
  const unlocked = sop.life && sop.brief && sop.weather;
  const isStarted = !!started[tid];

  const allParts = bookings.flatMap((b) => b.participants);
  const totalPax = allParts.length;
  const ciPax = allParts.filter((p) => checked[p.id]).length;
  const dueBookings = bookings.filter((b) => b.pay === "due");
  const outstanding = dueBookings.filter((b) => !collected[b.id]);
  const dueTotal = outstanding.reduce((a, b) => a + b.due, 0);
  const dueCount = outstanding.length;
  const collectedCount = dueBookings.length - outstanding.length;

  function checkAllInBooking(b: Booking, value: boolean) {
    setChecked((c) => {
      const next = { ...c };
      b.participants.forEach((p) => (next[p.id] = value));
      return next;
    });
  }

  function checkAll() {
    setChecked((c) => {
      const next = { ...c };
      allParts.forEach((p) => (next[p.id] = true));
      return next;
    });
  }

  const stat = [
    { k: "参加者", v: totalPax + "名", s: bookings.length + "予約", c: C.blue },
    { k: "出席確認", v: ciPax + "/" + totalPax + "名", s: Math.round((ciPax / totalPax) * 100) + "% 完了", c: C.green },
    {
      k: "未収金",
      v: "$" + dueTotal,
      s:
        dueCount > 0
          ? dueCount + "件 要回収" + (collectedCount ? " ・ " + collectedCount + "件回収済" : "")
          : collectedCount
          ? "全" + collectedCount + "件 回収済"
          : "未収なし",
      c: dueTotal ? C.red : C.green,
    },
    {
      k: "ツアー状態",
      v: isStarted ? "開始済" : unlocked ? "出発可" : "ロック中",
      s: isStarted ? "進行中" : Number(sop.life) + Number(sop.brief) + Number(sop.weather) + "/3 SOP",
      c: isStarted ? C.blue : unlocked ? C.green : C.amber,
    },
  ];

  const sopRow = (key: "life" | "brief" | "weather", lbl: string, sub: string) => {
    const on = sop[key];
    return (
      <div
        onClick={() => !isStarted && setSop((s) => ({ ...s, [key]: !s[key] }))}
        style={sx(
          "display:flex;align-items:center;gap:11px;padding:13px;background:" +
            (on ? "#E4F6EC" : "#fff") +
            ";border:1.5px solid " +
            (on ? "#BCE6CB" : C.line) +
            ";border-radius:13px;cursor:" +
            (isStarted ? "default" : "pointer") +
            ";transition:.15s"
        )}
      >
        <div
          style={sx(
            "width:24px;height:24px;border-radius:7px;border:2px solid " +
              (on ? C.green : "#CBD8E2") +
              ";background:" +
              (on ? C.green : "#fff") +
              ";display:flex;align-items:center;justify-content:center;flex-shrink:0"
          )}
        >
          {on ? (
            <Html html='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
          ) : null}
        </div>
        <div>
          <div style={sx("font-size:13px;font-weight:700;color:" + (on ? C.green : C.ink))}>{lbl}</div>
          <div style={sx("font-size:11px;color:" + C.sub)}>{sub}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* DATE + VIEW TABS */}
      <div style={sx("display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:14px")}>
        <div style={sx("display:flex;align-items:center;gap:10px")}>
          <Html
            html={
              '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="' +
              C.deep +
              '" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="' +
              C.deep +
              '" stroke-width="2" stroke-linecap="round"/></svg>'
            }
          />
          <div>
            <div style={sx("font-size:11px;color:" + C.sub + ";font-weight:700;letter-spacing:.3px")}>
              本日の運行日
            </div>
            <div className="font-outfit" style={sx("font-size:18px;font-weight:800;color:" + C.ink)}>
              {TOUR_DATE}
            </div>
          </div>
        </div>
        <div style={sx("display:flex;background:" + C.soft + ";border-radius:12px;padding:4px;gap:4px")}>
          {([
            ["roster", "出席・名簿"],
            ["transfer", "送迎・ルート"],
          ] as const).map(([id, lbl]) => {
            const on = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                style={sx(
                  "border:none;font-family:inherit;font-weight:700;font-size:13px;padding:8px 18px;border-radius:9px;cursor:pointer;transition:.15s;" +
                    (on
                      ? "background:#fff;color:" + C.blue + ";box-shadow:0 2px 8px rgba(0,0,0,.08)"
                      : "background:transparent;color:" + C.sub)
                )}
              >
                {lbl}
              </button>
            );
          })}
        </div>
      </div>

      {/* REGISTERED TOUR SLOTS (予約・カレンダーから相互参照) */}
      {regTours.length ? (
        <section style={sx(card + "padding:14px 18px;margin-bottom:16px")}>
          <div style={sx("display:flex;align-items:center;gap:8px;margin-bottom:4px")}>
            <Html
              html={
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="' +
                C.deep +
                '" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4" stroke="' +
                C.deep +
                '" stroke-width="2" stroke-linecap="round"/></svg>'
              }
            />
            <div style={sx(h2 + "font-size:14px")}>予約・カレンダーで登録されたツアー枠</div>
            <Html html={pill(regTours.length + "枠", C.deep, "#E3F2FB")} />
          </div>
          <div style={sx(label + "margin-bottom:10px")}>
            上限枠・担当管理者情報を相互参照（参加者の取込は今後OTA連携で対応）
          </div>
          <div style={sx("display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px")}>
            {regTours.map((t) => (
              <div key={t.id} style={sx("border:1px solid " + C.line + ";border-radius:12px;padding:11px 13px;background:#F9FCFE")}>
                <div style={sx("display:flex;align-items:center;gap:8px")}>
                  <span className="font-outfit" style={sx("font-weight:700;font-size:14px;color:" + C.blue)}>{t.time}</span>
                  <span style={sx("font-weight:700;font-size:13px")}>{t.name}</span>
                </div>
                <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:5px")}>
                  担当 {t.manager || "未設定"}
                  {t.contact ? " ・ " + t.contact : ""}
                </div>
                <div style={sx("display:flex;align-items:center;justify-content:space-between;margin-top:6px")}>
                  <span style={sx("font-size:11px;color:" + C.sub)}>{t.meet || "集合場所未設定"}</span>
                  <span className="font-outfit" style={sx("font-weight:700;font-size:13px;color:" + C.ink)}>
                    予約 {t.booked}/{t.capacity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* TOUR SELECTOR */}
      <div style={sx("display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px")}>
        {TOURS.map((t) => {
          const on = t.id === tid;
          const ps = DATASET[t.id].flatMap((b) => b.participants);
          const n = ps.filter((p) => checked[p.id]).length;
          return (
            <div
              key={t.id}
              onClick={() => setTid(t.id)}
              style={sx(
                "padding:11px 16px;border-radius:13px;cursor:pointer;border:1.5px solid " +
                  (on ? C.blue : C.line) +
                  ";background:" +
                  (on ? "#EAF6FD" : "#fff") +
                  ";min-width:160px"
              )}
            >
              <div style={sx("display:flex;align-items:center;gap:8px")}>
                <span className="font-outfit" style={sx("font-weight:700;font-size:14px;color:" + (on ? C.blue : C.ink))}>
                  {t.time}
                </span>
                <span style={sx("font-weight:700;font-size:13px;color:" + C.ink)}>{t.name}</span>
                {started[t.id] ? <Html html={pill("開始済", C.blue, "#E3F2FB")} /> : null}
              </div>
              <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:4px")}>
                ガイド {t.guide} ・ 出席 {n}/{ps.length}名
              </div>
            </div>
          );
        })}
      </div>

      {view === "transfer" ? (
        <TransferPanel lockedTour={tour.route} />
      ) : (
      <div className="r-split" style={sx("display:grid;grid-template-columns:1fr 330px;gap:18px;align-items:start")}>
        {/* LEFT */}
        <div style={sx("display:flex;flex-direction:column;gap:16px")}>
          <div className="r-grid-4" style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:13px")}>
            {stat.map((x, i) => (
              <div key={i} style={sx(card + "padding:14px 18px")}>
                <div style={sx(label)}>{x.k}</div>
                <div className="font-outfit" style={sx("font-weight:800;font-size:22px;color:" + x.c + ";margin-top:5px")}>
                  {x.v}
                </div>
                <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:2px")}>{x.s}</div>
              </div>
            ))}
          </div>

          <section style={sx(card + "padding:18px 16px")}>
            <div className="r-head" style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 4px")}>
              <div>
                <div style={sx(h2)}>
                  デジタル参加者名簿 — {tour.time} {tour.name}
                </div>
                <div style={sx(label + "margin-top:3px")}>
                  集合: {tour.meet} ・ 担当 {tour.guide} / {tour.van} ・ 予約者名と参加者名を分けて管理
                </div>
              </div>
              <button onClick={checkAll} style={sx(btn(C.blue, "#fff") + "display:flex;align-items:center;gap:8px")}>
                <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                全員を出席にする
              </button>
            </div>

            <div style={sx("display:flex;flex-direction:column;gap:11px")}>
              {bookings.map((b) => {
                const bChecked = b.participants.filter((p) => checked[p.id]).length;
                const allOn = bChecked === b.participants.length;
                return (
                  <div
                    key={b.id}
                    style={sx(
                      "border:1px solid " + C.line + ";border-radius:14px;overflow:hidden;background:#fff"
                    )}
                  >
                    {/* BOOKING HEADER */}
                    <div
                      className="r-wrap"
                      style={sx(
                        "display:flex;align-items:center;gap:12px;padding:11px 14px;background:" + C.soft
                      )}
                    >
                      {/* 予約者情報（縦潰れ防止のため最小幅を確保） */}
                      <div style={sx("flex:1;min-width:190px;display:flex;align-items:center;gap:12px")}>
                        <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 7h18v13H3V7Z" stroke="#6E8BA0" stroke-width="2" stroke-linejoin="round"/><path d="M8 7V4h8v3" stroke="#6E8BA0" stroke-width="2"/></svg>' />
                        <div style={sx("flex:1;min-width:0")}>
                          <div style={sx("font-weight:800;font-size:13px")}>
                            予約者: {b.booker}
                            {b.participants.length > 1 ? (
                              <span style={sx("font-weight:700;font-size:11px;color:" + C.blue + ";margin-left:8px")}>
                                団体 {b.participants.length}名
                              </span>
                            ) : null}
                          </div>
                          <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:2px")}>
                            {b.bk} ・ {b.ch}
                            {b.note ? " ・ " + b.note : ""}
                          </div>
                        </div>
                      </div>
                      {/* 決済状況＋操作ボタン（狭い画面では下段に折返し） */}
                      <div style={sx("display:flex;align-items:center;gap:8px;flex-wrap:wrap")}>
                        {b.pay === "due" ? (
                          <>
                            <Html
                              html={
                                collected[b.id]
                                  ? pill("回収済", C.green, "#E4F6EC")
                                  : pill("未収 $" + b.due, C.red, "#FDEBEB")
                              }
                            />
                            <button
                              onClick={() => setCollected((c) => ({ ...c, [b.id]: !c[b.id] }))}
                              style={sx(
                                "border:none;font-family:inherit;font-weight:700;font-size:11px;padding:6px 10px;border-radius:9px;cursor:pointer;white-space:nowrap;" +
                                  (collected[b.id]
                                    ? "background:" + C.soft + ";color:" + C.sub
                                    : "background:#FDEBEB;color:" + C.red)
                              )}
                            >
                              {collected[b.id] ? "未収に戻す" : "回収済にする"}
                            </button>
                          </>
                        ) : (
                          <Html html={pill("決済済", C.green, "#E4F6EC")} />
                        )}
                        <button
                          onClick={() => checkAllInBooking(b, !allOn)}
                          style={sx(
                            "border:none;font-family:inherit;font-weight:700;font-size:11px;padding:6px 10px;border-radius:9px;cursor:pointer;white-space:nowrap;" +
                              (allOn ? "background:#E4F6EC;color:" + C.green : "background:" + C.blue + ";color:#fff")
                          )}
                        >
                          {allOn ? "全員出席済" : "この予約を全員出席"}
                        </button>
                      </div>
                    </div>

                    {/* PARTICIPANT ROWS */}
                    {b.participants.map((p) => {
                      const ci = !!checked[p.id];
                      return (
                        <div
                          key={p.id}
                          style={sx(
                            "display:flex;align-items:center;gap:12px;padding:10px 14px;border-top:1px solid #F0F5F8;background:" +
                              (ci ? "#FAFEFB" : "#fff")
                          )}
                        >
                          <button
                            onClick={() => setChecked((c) => ({ ...c, [p.id]: !c[p.id] }))}
                            style={sx(
                              "display:flex;align-items:center;justify-content:center;gap:6px;width:120px;padding:8px 0;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:12px;" +
                                (ci ? "background:#E4F6EC;color:" + C.green : "background:" + C.blue + ";color:#fff")
                            )}
                          >
                            {ci ? (
                              <>
                                <Html
                                  html={
                                    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="' +
                                    C.green +
                                    '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                                  }
                                />
                                出席確認済
                              </>
                            ) : (
                              "タップで出席確認"
                            )}
                          </button>
                          <div style={sx("flex:1;font-weight:700;font-size:13px;color:" + (ci ? C.ink : "#3A5566"))}>
                            {p.name}
                          </div>
                          {ci ? <Html html={pill("出席", C.green, "#E4F6EC")} /> : <span style={sx("font-size:11px;color:#9DB4C4")}>未確認</span>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div style={sx("display:flex;flex-direction:column;gap:16px")}>
          <section style={sx(card + "padding:18px 18px")}>
            <div style={sx(h2 + "font-size:15px;margin-bottom:4px;display:flex;align-items:center;gap:8px")}>
              <Html
                html={
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="' +
                  C.deep +
                  '" stroke-width="2" stroke-linejoin="round"/></svg>'
                }
              />
              安全SOPチェック
            </div>
            <div style={sx(label + "margin-bottom:12px")}>全項目の完了で「ツアー開始」のロックを解除</div>
            <div style={sx("display:flex;flex-direction:column;gap:9px")}>
              {sopRow("life", "ライフジャケット点検完了", "全" + totalPax + "名分のサイズ・装着確認")}
              {sopRow("brief", "注意事項・ブリーフィング説明完了", "安全説明と緊急時手順の周知")}
              {sopRow("weather", "当日海況の最終確認完了", "波高・風速・潮位の出発前確認")}
            </div>
            <button
              disabled={!unlocked || isStarted}
              onClick={() => unlocked && setStarted((s) => ({ ...s, [tid]: true }))}
              style={sx(
                "width:100%;margin-top:14px;border:none;border-radius:13px;padding:15px;font-family:inherit;font-weight:800;font-size:14px;" +
                  (isStarted
                    ? "background:" + C.blue + ";color:#fff;cursor:default;box-shadow:0 8px 18px rgba(14,143,201,.35)"
                    : unlocked
                    ? "background:" + C.green + ";color:#fff;cursor:pointer;box-shadow:0 8px 18px rgba(22,163,74,.35)"
                    : "background:#E3E9EE;color:#9DB4C4;cursor:not-allowed")
              )}
            >
              {isStarted
                ? "🚩 ツアー進行中 — 開始済み"
                : unlocked
                ? "✓ ツアーを開始ステータスへ移行"
                : "🔒 SOP未完了 — 開始不可"}
            </button>
            {isStarted ? (
              <div
                style={sx(
                  "margin-top:10px;font-size:12px;color:" +
                    C.blue +
                    ";background:#E3F2FB;border-radius:10px;padding:9px 12px;text-align:center;font-weight:700"
                )}
              >
                {tour.time} {tour.name} を開始しました（出席 {ciPax}/{totalPax}名）
              </div>
            ) : null}
          </section>

          <section style={sx(card + "padding:16px 18px")}>
            <div style={sx(h2 + "font-size:14px;margin-bottom:10px")}>現場アクション</div>
            <div style={sx("display:flex;flex-direction:column;gap:9px")}>
              <button
                onClick={() => setSos(true)}
                style={sx(
                  btn(sos ? "#E4F6EC" : "#FDEBEB", sos ? C.green : C.red) +
                    "width:100%;text-align:left;display:flex;align-items:center;gap:9px"
                )}
              >
                <Html
                  html={
                    sos
                      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="' +
                        C.green +
                        '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3l9-16Z" stroke="' +
                        C.red +
                        '" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 16h.01" stroke="' +
                        C.red +
                        '" stroke-width="2" stroke-linecap="round"/></svg>'
                  }
                />
                {sos ? "本部へSOSを送信しました" : "本部へSOS・トラブル報告"}
              </button>
              <button
                onClick={() => dueCount > 0 && setReminded(true)}
                disabled={dueCount === 0}
                style={sx(
                  btn(reminded ? "#E4F6EC" : C.soft, reminded ? C.green : C.deep) +
                    "width:100%;text-align:left;display:flex;align-items:center;gap:9px;" +
                    (dueCount === 0 ? "opacity:.5;cursor:not-allowed" : "")
                )}
              >
                <Html
                  html={
                    reminded
                      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="' +
                        C.green +
                        '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H7l-3 3V4Z" stroke="' +
                        C.deep +
                        '" stroke-width="2" stroke-linejoin="round"/></svg>'
                  }
                />
                {reminded ? "集金リマインドを送信しました" : "未収者へ集金リマインド (" + dueCount + ")"}
              </button>
            </div>
            {sos || reminded ? (
              <div style={sx("margin-top:10px;font-size:11px;color:" + C.sub + ";text-align:center")}>
                送信履歴はチャットスレッドに記録されます
              </div>
            ) : null}
          </section>
        </div>
      </div>
      )}
    </>
  );
}
