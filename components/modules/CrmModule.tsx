"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";

interface Agent {
  id: string;
  n: string;
  tag: string;
  contact: string;
  bookings: number;
  gross: number;
  rate: number; // 手数料率(%)
}

const INITIAL_AGENTS: Agent[] = [
  { id: "a1", n: "Experience Oz", tag: "OTA", contact: "partners@experienceoz.com.au", bookings: 24, gross: 4820, rate: 15 },
  { id: "a2", n: "Hilton Surfers Paradise", tag: "ホテル", contact: "concierge@hilton-sp.com", bookings: 18, gross: 3210, rate: 12 },
  { id: "a3", n: "Marriott Resort", tag: "ホテル", contact: "tours@marriott-gc.com", bookings: 12, gross: 2480, rate: 12 },
  { id: "a4", n: "Viator", tag: "OTA", contact: "supply@viator.com", bookings: 9, gross: 1760, rate: 18 },
];

const TAGS = ["OTA", "ホテル", "旅行会社", "その他"];

export function CrmModule() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [invoiced, setInvoiced] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ n: "", tag: "OTA", contact: "", rate: "15" });

  const fee = (a: Agent) => Math.round((a.gross * a.rate) / 100);
  const total = agents.reduce((s, a) => s + fee(a), 0);

  function addAgent() {
    if (!form.n.trim()) return;
    setAgents((prev) => [
      ...prev,
      {
        id: "a" + Date.now(),
        n: form.n.trim(),
        tag: form.tag,
        contact: form.contact.trim(),
        bookings: 0,
        gross: 0,
        rate: Number(form.rate) || 0,
      },
    ]);
    setForm({ n: "", tag: "OTA", contact: "", rate: "15" });
    setAdding(false);
    setInvoiced(false);
  }

  function removeAgent(id: string) {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  const inputStyle = sx(
    "width:100%;box-sizing:border-box;border:1px solid " +
      C.line +
      ";border-radius:10px;padding:10px 12px;font-family:inherit;font-size:13px;color:" +
      C.ink +
      ";outline:none"
  );

  return (
    <div>
      {/* SUMMARY STRIP */}
      <div style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px")}>
        {[
          { k: "登録代理店", v: agents.length + "社", c: C.blue },
          { k: "今月の予約", v: agents.reduce((s, a) => s + a.bookings, 0) + "件", c: C.teal },
          { k: "送客売上", v: "$" + agents.reduce((s, a) => s + a.gross, 0).toLocaleString(), c: C.green },
          { k: "回収予定 手数料", v: "$" + total.toLocaleString(), c: C.amber },
        ].map((s, i) => (
          <div key={i} style={sx(card + "padding:15px 18px")}>
            <div style={sx(label)}>{s.k}</div>
            <div
              className="font-outfit"
              style={sx("font-weight:800;font-size:24px;color:" + s.c + ";margin-top:6px")}
            >
              {s.v}
            </div>
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
            <div style={sx(h2)}>代理店マスター ＆ 月末精算（2026年6月）</div>
            <div style={sx(label + "margin-top:3px")}>代理店を登録し、予約数・手数料率から回収額を自動集計</div>
          </div>
          <div style={sx("display:flex;gap:9px")}>
            <button
              onClick={() => setAdding((v) => !v)}
              style={sx(btn(C.blue, "#fff") + "display:flex;align-items:center;gap:7px")}
            >
              <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
              代理店を登録
            </button>
            <button
              onClick={() => setInvoiced(true)}
              style={sx(btn(C.green, "#fff") + "display:flex;align-items:center;gap:8px")}
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
        </div>

        {/* ADD FORM */}
        {adding ? (
          <div
            style={sx(
              "background:#F2FAFE;border:1.5px solid #CFE7F4;border-radius:14px;padding:16px;margin:0 4px 16px;display:grid;grid-template-columns:1.4fr .8fr 1.4fr .7fr auto;gap:11px;align-items:end"
            )}
          >
            <div>
              <div style={sx(label + "margin-bottom:5px")}>代理店名 *</div>
              <input
                style={inputStyle}
                value={form.n}
                onChange={(e) => setForm({ ...form, n: e.target.value })}
                placeholder="例: Klook"
              />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>区分</div>
              <select
                style={inputStyle}
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              >
                {TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>連絡先</div>
              <input
                style={inputStyle}
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                placeholder="メール / 電話"
              />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>手数料率 %</div>
              <input
                style={inputStyle}
                type="number"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
              />
            </div>
            <button onClick={addAgent} style={sx(btn(C.green, "#fff") + "white-space:nowrap")}>
              追加
            </button>
          </div>
        ) : null}

        <div
          style={sx(
            "display:grid;grid-template-columns:1.5fr .7fr 1.4fr .8fr 1fr .8fr 1fr 30px;gap:12px;padding:0 16px 10px;font-size:11px;font-weight:700;color:" +
              C.sub
          )}
        >
          <div>代理店 / 予約元タグ</div>
          <div>区分</div>
          <div>連絡先</div>
          <div style={sx("text-align:center")}>予約数</div>
          <div style={sx("text-align:right")}>売上</div>
          <div style={sx("text-align:center")}>手数料率</div>
          <div style={sx("text-align:right")}>回収額</div>
          <div />
        </div>
        {agents.map((a) => (
          <div
            key={a.id}
            style={sx(
              "display:grid;grid-template-columns:1.5fr .7fr 1.4fr .8fr 1fr .8fr 1fr 30px;gap:12px;align-items:center;" +
                card +
                "padding:13px 16px;margin-bottom:9px"
            )}
          >
            <div style={sx("font-weight:700;font-size:13px")}>{a.n}</div>
            <div>
              <Html html={pill(a.tag, C.deep, "#E3F2FB")} />
            </div>
            <div style={sx("font-size:11px;color:" + C.sub + ";overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>
              {a.contact || "—"}
            </div>
            <div className="font-outfit" style={sx("text-align:center;font-weight:700")}>
              {a.bookings}
            </div>
            <div className="font-outfit" style={sx("text-align:right;font-weight:600;color:" + C.sub)}>
              ${a.gross.toLocaleString()}
            </div>
            <div style={sx("text-align:center;font-weight:700;color:" + C.amber)}>{a.rate}%</div>
            <div
              className="font-outfit"
              style={sx("text-align:right;font-weight:800;font-size:15px;color:" + C.green)}
            >
              ${fee(a).toLocaleString()}
            </div>
            <div
              onClick={() => removeAgent(a.id)}
              title="削除"
              style={sx(
                "cursor:pointer;display:flex;align-items:center;justify-content:center;color:#C0CDD8"
              )}
            >
              <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5h6v2M7 7l1 13h8l1-13" stroke="#9DB4C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
            </div>
          </div>
        ))}
        <div
          style={sx(
            "display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-top:6px;padding:12px 16px;background:#F2FAFE;border-radius:12px"
          )}
        >
          <span style={sx("font-size:13px;font-weight:700;color:" + C.deep)}>6月 回収予定 合計</span>
          <span className="font-outfit" style={sx("font-weight:800;font-size:22px;color:" + C.green)}>
            ${total.toLocaleString()}
          </span>
        </div>

        <div
          style={sx(
            "margin-top:14px;background:#FFF8F1;border:1px dashed #F3D9BC;border-radius:12px;padding:11px 14px;font-size:12px;color:#9A5B2E;display:flex;align-items:center;gap:8px"
          )}
        >
          <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#B4480E" stroke-width="2"/><path d="M12 8v5M12 16h.01" stroke="#B4480E" stroke-width="2" stroke-linecap="round"/></svg>' />
          <span>
            将来的に <b>OTA（Experience Oz / Viator など）の予約データを自動連携</b>{" "}
            し、予約数・売上をリアルタイム取込予定です。
          </span>
        </div>
      </section>
    </div>
  );
}
