"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";

const CUSTOMERS = [
  { n: "Emma Wilson", c: "🇦🇺", visits: 4, last: "スノーケル (5月)", allergy: "甲殻類アレルギー", spend: "$1,240", note: "リピーター・VIP" },
  { n: "Liam Chen", c: "🇸🇬", visits: 2, last: "ジェットスキー (4月)", allergy: "なし", spend: "$680", note: "英語ガイド希望" },
  { n: "Sophie Martin", c: "🇫🇷", visits: 1, last: "パラセーリング (6月)", allergy: "日焼け止めアレルギー", spend: "$210", note: "初回" },
  { n: "Kenji Sato", c: "🇯🇵", visits: 6, last: "SUP (6月)", allergy: "なし", spend: "$2,050", note: "リピーター・写真撮影希望" },
];

const AGENTS = [
  { n: "Experience Oz", tag: "OTA", bookings: 24, gross: 4820, rate: "15%", fee: 723 },
  { n: "Hilton Surfers Paradise", tag: "ホテル", bookings: 18, gross: 3210, rate: "12%", fee: 385 },
  { n: "Marriott Resort", tag: "ホテル", bookings: 12, gross: 2480, rate: "12%", fee: 298 },
  { n: "Viator", tag: "OTA", bookings: 9, gross: 1760, rate: "18%", fee: 317 },
];

export function CrmModule() {
  const [tab, setTab] = useState<"customers" | "settle">("customers");
  const [invoiced, setInvoiced] = useState(false);

  const tabBtn = (id: "customers" | "settle", lbl: string) => {
    const on = tab === id;
    return (
      <div
        onClick={() => setTab(id)}
        style={sx(
          "padding:9px 16px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;" +
            (on ? "background:" + C.blue + ";color:#fff" : "background:" + C.soft + ";color:" + C.sub)
        )}
      >
        {lbl}
      </div>
    );
  };

  const total = AGENTS.reduce((s, a) => s + a.fee, 0);

  return (
    <div>
      <div style={sx("display:flex;gap:9px;margin-bottom:16px")}>
        {tabBtn("customers", "顧客CRM")}
        {tabBtn("settle", "代理店精算")}
      </div>

      {tab === "customers" ? (
        <div style={sx("display:grid;grid-template-columns:repeat(2,1fr);gap:14px")}>
          {CUSTOMERS.map((c, i) => (
            <div key={i} style={sx(card + "padding:16px 18px")}>
              <div style={sx("display:flex;align-items:center;gap:11px")}>
                <div
                  style={sx(
                    "width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#0E8FC9,#22B3C9);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700"
                  )}
                >
                  {c.n.charAt(0)}
                </div>
                <div style={sx("flex:1")}>
                  <div style={sx("font-weight:700;font-size:14px")}>
                    {c.n} <span style={sx("font-size:13px")}>{c.c}</span>
                  </div>
                  <div style={sx("font-size:11px;color:" + C.sub)}>
                    参加 {c.visits}回 ・ 累計 {c.spend}
                  </div>
                </div>
                <Html html={pill(c.note, C.deep, "#E3F2FB")} />
              </div>
              <div style={sx("display:flex;gap:10px;margin-top:13px")}>
                <div style={sx("flex:1;background:" + C.soft + ";border-radius:10px;padding:9px 11px")}>
                  <div style={sx(label)}>最終参加</div>
                  <div style={sx("font-size:12px;font-weight:600;margin-top:3px")}>{c.last}</div>
                </div>
                <div
                  style={sx(
                    "flex:1;background:" +
                      (c.allergy === "なし" ? C.soft : "#FFF6E8") +
                      ";border-radius:10px;padding:9px 11px"
                  )}
                >
                  <div style={sx(label)}>アレルギー・注意</div>
                  <div
                    style={sx(
                      "font-size:12px;font-weight:600;margin-top:3px;color:" +
                        (c.allergy === "なし" ? C.ink : C.amber)
                    )}
                  >
                    {c.allergy}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section style={sx(card + "padding:18px 16px")}>
          <div
            style={sx(
              "display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:0 4px"
            )}
          >
            <div>
              <div style={sx(h2)}>月末 代理店精算（2026年6月）</div>
              <div style={sx(label + "margin-top:3px")}>予約元タグから手数料を自動集計</div>
            </div>
            <button
              onClick={() => setInvoiced(true)}
              style={{
                ...sx(
                  btn(invoiced ? C.green : C.green, "#fff") +
                    "display:flex;align-items:center;gap:8px"
                ),
              }}
            >
              {invoiced ? (
                "✓ 請求書データを作成しました"
              ) : (
                <>
                  <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v13H7V3Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M13 3v6h6M10 14h6M10 17h4" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
                  請求書データを作成
                </>
              )}
            </button>
          </div>
          <div
            style={sx(
              "display:grid;grid-template-columns:1.6fr .8fr .9fr 1fr .9fr 1fr;gap:12px;padding:0 16px 10px;font-size:11px;font-weight:700;color:" +
                C.sub
            )}
          >
            <div>代理店 / 予約元タグ</div>
            <div>区分</div>
            <div style={sx("text-align:center")}>予約数</div>
            <div style={sx("text-align:right")}>売上</div>
            <div style={sx("text-align:center")}>手数料率</div>
            <div style={sx("text-align:right")}>回収額（バウチャー代）</div>
          </div>
          {AGENTS.map((a, i) => (
            <div
              key={i}
              style={sx(
                "display:grid;grid-template-columns:1.6fr .8fr .9fr 1fr .9fr 1fr;gap:12px;align-items:center;" +
                  card +
                  "padding:13px 16px;margin-bottom:9px"
              )}
            >
              <div style={sx("font-weight:700;font-size:13px")}>{a.n}</div>
              <div>
                <Html html={pill(a.tag, C.deep, "#E3F2FB")} />
              </div>
              <div className="font-outfit" style={sx("text-align:center;font-weight:700")}>
                {a.bookings}
              </div>
              <div
                className="font-outfit"
                style={sx("text-align:right;font-weight:600;color:" + C.sub)}
              >
                ${a.gross.toLocaleString()}
              </div>
              <div style={sx("text-align:center;font-weight:700;color:" + C.amber)}>{a.rate}</div>
              <div
                className="font-outfit"
                style={sx("text-align:right;font-weight:800;font-size:15px;color:" + C.green)}
              >
                ${a.fee.toLocaleString()}
              </div>
            </div>
          ))}
          <div
            style={sx(
              "display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-top:6px;padding:12px 16px;background:#F2FAFE;border-radius:12px"
            )}
          >
            <span style={sx("font-size:13px;font-weight:700;color:" + C.deep)}>
              6月 回収予定 合計
            </span>
            <span
              className="font-outfit"
              style={sx("font-weight:800;font-size:22px;color:" + C.green)}
            >
              ${total.toLocaleString()}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
