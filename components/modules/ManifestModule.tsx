"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";

interface Participant {
  id: string;
  n: string;
  pax: number;
  bk: string;
  ch: string;
  pay: "paid" | "due";
  due: number;
  note: string;
}

const TOURS = [
  { id: "m1", name: "モーニング・スノーケル", time: "08:00", guide: "K. Lee", van: "バン #2", meet: "Cavill Ave 桟橋" },
  { id: "m2", name: "パラセーリング 第1便", time: "09:30", guide: "M. Tan", van: "バン #4", meet: "Marina Mirage" },
  { id: "m3", name: "ジェットスキー体験", time: "11:00", guide: "J. Park", van: "バン #7", meet: "Mariners Cove" },
];

const DATASET: Record<string, Participant[]> = {
  m1: [
    { id: "m1a", n: "Emma Wilson", pax: 2, bk: "GC-2284", ch: "自社サイト", pay: "paid", due: 0, note: "甲殻類アレルギー" },
    { id: "m1b", n: "Liam Chen", pax: 1, bk: "GC-2287", ch: "Hilton", pay: "paid", due: 0, note: "" },
    { id: "m1c", n: "Sophie Martin", pax: 2, bk: "GC-2291", ch: "Experience Oz", pay: "due", due: 80, note: "バウチャー未精算" },
    { id: "m1d", n: "Kenji Sato", pax: 1, bk: "GC-2293", ch: "自社サイト", pay: "paid", due: 0, note: "写真撮影希望" },
    { id: "m1e", n: "David & Anna Cole", pax: 2, bk: "GC-2298", ch: "Marriott", pay: "paid", due: 0, note: "" },
    { id: "m1f", n: "Walk-in（現地）", pax: 2, bk: "—", ch: "ウォークイン", pay: "due", due: 90, note: "現金未収" },
  ],
  m2: [
    { id: "m2a", n: "Olivia Brown", pax: 2, bk: "GC-2301", ch: "Viator", pay: "paid", due: 0, note: "" },
    { id: "m2b", n: "Hiroshi Tanaka", pax: 3, bk: "GC-2305", ch: "自社サイト", pay: "paid", due: 0, note: "高所恐怖症の同伴者あり" },
    { id: "m2c", n: "Marco Rossi", pax: 2, bk: "GC-2309", ch: "Q1 Resort", pay: "due", due: 120, note: "バウチャー未精算" },
    { id: "m2d", n: "Grace Kim", pax: 1, bk: "GC-2312", ch: "自社サイト", pay: "paid", due: 0, note: "" },
  ],
  m3: [
    { id: "m3a", n: "James Wilson", pax: 2, bk: "GC-2320", ch: "Experience Oz", pay: "paid", due: 0, note: "" },
    { id: "m3b", n: "Mei Lin", pax: 2, bk: "GC-2322", ch: "Peppers", pay: "paid", due: 0, note: "初心者" },
    { id: "m3c", n: "Tom Baker", pax: 1, bk: "GC-2325", ch: "自社サイト", pay: "due", due: 60, note: "残金 現地払い" },
    { id: "m3d", n: "Yuki Mori", pax: 1, bk: "GC-2327", ch: "自社サイト", pay: "paid", due: 0, note: "" },
  ],
};

const GRID = "118px 1.5fr .6fr .9fr 1fr .9fr 1.4fr";

export function ManifestModule() {
  const [sop, setSop] = useState({ life: false, brief: false, weather: false });
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [tid, setTid] = useState("m1");

  const tour = TOURS.find((t) => t.id === tid)!;
  const parts = DATASET[tid];
  const unlocked = sop.life && sop.brief && sop.weather;

  const totalPax = parts.reduce((a, p) => a + p.pax, 0);
  const ciPax = parts.filter((p) => checked[p.id]).reduce((a, p) => a + p.pax, 0);
  const ciCount = parts.filter((p) => checked[p.id]).length;
  const dueTotal = parts.filter((p) => p.pay === "due").reduce((a, p) => a + p.due, 0);
  const dueCount = parts.filter((p) => p.pay === "due").length;

  function scan() {
    const next = parts.find((p) => !checked[p.id]);
    if (next) setChecked((c) => ({ ...c, [next.id]: true }));
  }

  const stat = [
    { k: "参加者", v: totalPax + "名", s: parts.length + "予約", c: C.blue },
    { k: "チェックイン", v: ciPax + "/" + totalPax + "名", s: ciCount + "/" + parts.length + " 予約", c: C.green },
    { k: "未収金", v: "$" + dueTotal, s: dueCount + "件 要回収", c: dueTotal ? C.red : C.green },
    {
      k: "安全SOP",
      v: unlocked ? "完了" : Number(sop.life) + Number(sop.brief) + Number(sop.weather) + "/3",
      s: unlocked ? "出発可" : "ロック中",
      c: unlocked ? C.green : C.amber,
    },
  ];

  const sopRow = (key: "life" | "brief" | "weather", lbl: string, sub: string) => {
    const on = sop[key];
    return (
      <div
        onClick={() => setSop((s) => ({ ...s, [key]: !s[key] }))}
        style={sx(
          "display:flex;align-items:center;gap:11px;padding:13px;background:" +
            (on ? "#E4F6EC" : "#fff") +
            ";border:1.5px solid " +
            (on ? "#BCE6CB" : C.line) +
            ";border-radius:13px;cursor:pointer;transition:.15s"
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
          <div style={sx("font-size:13px;font-weight:700;color:" + (on ? C.green : C.ink))}>
            {lbl}
          </div>
          <div style={sx("font-size:11px;color:" + C.sub)}>{sub}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* TOUR SELECTOR */}
      <div style={sx("display:flex;flex-wrap:wrap;gap:12px;margin-bottom:18px")}>
        {TOURS.map((t) => {
          const on = t.id === tid;
          const n = DATASET[t.id].filter((p) => checked[p.id]).length;
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
                <span
                  className="font-outfit"
                  style={sx("font-weight:700;font-size:14px;color:" + (on ? C.blue : C.ink))}
                >
                  {t.time}
                </span>
                <span style={sx("font-weight:700;font-size:13px;color:" + C.ink)}>{t.name}</span>
              </div>
              <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:4px")}>
                ガイド {t.guide} ・ チェックイン {n}/{DATASET[t.id].length}
              </div>
            </div>
          );
        })}
      </div>

      <div style={sx("display:grid;grid-template-columns:1fr 330px;gap:18px;align-items:start")}>
        {/* LEFT */}
        <div style={sx("display:flex;flex-direction:column;gap:16px")}>
          <div style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:13px")}>
            {stat.map((x, i) => (
              <div key={i} style={sx(card + "padding:14px 18px")}>
                <div style={sx(label)}>{x.k}</div>
                <div
                  className="font-outfit"
                  style={sx("font-weight:800;font-size:22px;color:" + x.c + ";margin-top:5px")}
                >
                  {x.v}
                </div>
                <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:2px")}>{x.s}</div>
              </div>
            ))}
          </div>

          <section style={sx(card + "padding:18px 16px")}>
            <div
              style={sx(
                "display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 4px"
              )}
            >
              <div>
                <div style={sx(h2)}>
                  デジタル参加者名簿 — {tour.time} {tour.name}
                </div>
                <div style={sx(label + "margin-top:3px")}>
                  集合: {tour.meet} ・ 担当 {tour.guide} / {tour.van}
                </div>
              </div>
              <button
                onClick={scan}
                style={sx(btn(C.blue, "#fff") + "display:flex;align-items:center;gap:8px")}
              >
                <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><path d="M14 14h3v3M21 14v7h-7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
                QRスキャンで点呼
              </button>
            </div>
            <div
              style={sx(
                "display:grid;grid-template-columns:" +
                  GRID +
                  ";gap:10px;padding:0 16px 9px;font-size:11px;font-weight:700;color:" +
                  C.sub
              )}
            >
              <div>チェックイン</div>
              <div>参加者名</div>
              <div style={sx("text-align:center")}>人数</div>
              <div>予約番号</div>
              <div>チャネル</div>
              <div style={sx("text-align:center")}>決済</div>
              <div>アレルギー・備考</div>
            </div>
            {parts.map((p) => {
              const ci = !!checked[p.id];
              return (
                <div
                  key={p.id}
                  style={sx(
                    "display:grid;grid-template-columns:" +
                      GRID +
                      ";gap:10px;align-items:center;padding:11px 16px;border-bottom:1px solid #F0F5F8;background:" +
                      (ci ? "#FAFEFB" : "#fff")
                  )}
                >
                  <div>
                    <button
                      onClick={() => setChecked((c) => ({ ...c, [p.id]: !c[p.id] }))}
                      style={sx(
                        "display:flex;align-items:center;justify-content:center;gap:5px;width:104px;padding:8px 0;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-weight:700;font-size:12px;" +
                          (ci
                            ? "background:#E4F6EC;color:" + C.green
                            : "background:" + C.blue + ";color:#fff")
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
                          済
                        </>
                      ) : (
                        <>
                          <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="#fff" stroke-width="2"/><path d="M14 14h3v3M21 14v7h-7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
                          QR点呼
                        </>
                      )}
                    </button>
                  </div>
                  <div style={sx("font-weight:700;font-size:13px")}>{p.n}</div>
                  <div className="font-outfit" style={sx("text-align:center;font-weight:700")}>
                    {p.pax}
                  </div>
                  <div style={sx("font-size:12px;color:" + C.sub)}>{p.bk}</div>
                  <div style={sx("font-size:12px")}>{p.ch}</div>
                  <div style={sx("text-align:center")}>
                    <Html
                      html={
                        p.pay === "due"
                          ? pill("未収 $" + p.due, C.red, "#FDEBEB")
                          : pill("決済済", C.green, "#E4F6EC")
                      }
                    />
                  </div>
                  <div
                    style={sx(
                      "font-size:12px;color:" +
                        (p.note ? (p.pay === "due" ? C.amber : C.ink) : "#C0CDD8")
                    )}
                  >
                    {p.note || "—"}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        {/* RIGHT */}
        <div style={sx("display:flex;flex-direction:column;gap:16px")}>
          <section style={sx(card + "padding:18px 18px")}>
            <div
              style={sx(
                h2 + "font-size:15px;margin-bottom:4px;display:flex;align-items:center;gap:8px"
              )}
            >
              <Html
                html={
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" stroke="' +
                  C.deep +
                  '" stroke-width="2" stroke-linejoin="round"/></svg>'
                }
              />
              安全SOPチェック
            </div>
            <div style={sx(label + "margin-bottom:12px")}>
              全項目の完了で「ツアー開始」のロックを解除
            </div>
            <div style={sx("display:flex;flex-direction:column;gap:9px")}>
              {sopRow("life", "ライフジャケット点検完了", "全" + totalPax + "名分のサイズ・装着確認")}
              {sopRow("brief", "注意事項・ブリーフィング説明完了", "安全説明と緊急時手順の周知")}
              {sopRow("weather", "当日海況の最終確認完了", "波高・風速・潮位の出発前確認")}
            </div>
            <button
              disabled={!unlocked}
              style={sx(
                "width:100%;margin-top:14px;border:none;border-radius:13px;padding:15px;font-family:inherit;font-weight:800;font-size:14px;" +
                  (unlocked
                    ? "background:" + C.green + ";color:#fff;cursor:pointer;box-shadow:0 8px 18px rgba(22,163,74,.35)"
                    : "background:#E3E9EE;color:#9DB4C4;cursor:not-allowed")
              )}
            >
              {unlocked ? "✓ ツアーを開始ステータスへ移行" : "🔒 SOP未完了 — 開始不可"}
            </button>
          </section>

          <section style={sx(card + "padding:16px 18px")}>
            <div style={sx(h2 + "font-size:14px;margin-bottom:10px")}>現場アクション</div>
            <div style={sx("display:flex;flex-direction:column;gap:9px")}>
              <button
                style={sx(
                  btn("#FDEBEB", C.red) +
                    "width:100%;text-align:left;display:flex;align-items:center;gap:9px"
                )}
              >
                <Html
                  html={
                    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3l9-16Z" stroke="' +
                    C.red +
                    '" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 16h.01" stroke="' +
                    C.red +
                    '" stroke-width="2" stroke-linecap="round"/></svg>'
                  }
                />
                本部へSOS・トラブル報告
              </button>
              <button
                style={sx(
                  btn(C.soft, C.deep) +
                    "width:100%;text-align:left;display:flex;align-items:center;gap:9px"
                )}
              >
                <Html
                  html={
                    '<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="' +
                    C.deep +
                    '" stroke-width="2"/><path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" stroke="' +
                    C.deep +
                    '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                  }
                />
                未収者へ集金リマインド ({dueCount})
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
