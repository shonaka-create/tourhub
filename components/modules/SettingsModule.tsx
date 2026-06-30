"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";

interface RoleRow {
  id: string;
  name: string;
  role: string;
  perms: { booking: boolean; assign: boolean; sales: boolean; settings: boolean };
}

const ROLE_LABELS: Record<string, string> = {
  booking: "予約編集",
  assign: "アサイン",
  sales: "売上閲覧",
  settings: "設定変更",
};

export function SettingsModule() {
  // 悪天候の基準値
  const [waveMax, setWaveMax] = useState(2.0);
  const [windMax, setWindMax] = useState(12);
  const [autoAlert, setAutoAlert] = useState(true);

  // 通知テンプレート
  const TEMPLATES = [
    { id: "remind", k: "前日リマインド", v: "明日{time}より{tour}を開催します。集合場所: {meet}。Google Mapsピン: {map}" },
    { id: "consent", k: "免責同意書 依頼", v: "ご参加にあたり、こちらのフォームより電子署名をお願いします: {link}" },
    { id: "thanks", k: "サンクスメール", v: "本日は{tour}へのご参加ありがとうございました。よろしければ口コミのご協力を: {review}" },
    { id: "storm", k: "悪天候リスケ案内", v: "本日の海況（波高{wave}m/風速{wind}m/s）により、{tour}をリスケ/返金いたします。" },
  ];
  const [templates, setTemplates] = useState(TEMPLATES);

  // ユーザー権限
  const [roles, setRoles] = useState<RoleRow[]>([
    { id: "u1", name: "山田 太郎", role: "オペレーション本部", perms: { booking: true, assign: true, sales: true, settings: true } },
    { id: "u2", name: "K. Lee", role: "現場ガイド", perms: { booking: false, assign: false, sales: false, settings: false } },
    { id: "u3", name: "B. Cho", role: "ドライバー", perms: { booking: false, assign: false, sales: false, settings: false } },
    { id: "u4", name: "受付 A", role: "フロント受付", perms: { booking: true, assign: false, sales: false, settings: false } },
  ]);

  const [saved, setSaved] = useState(false);

  function togglePerm(uid: string, key: keyof RoleRow["perms"]) {
    setSaved(false);
    setRoles((prev) =>
      prev.map((r) => (r.id === uid ? { ...r, perms: { ...r.perms, [key]: !r.perms[key] } } : r))
    );
  }

  const inputStyle = sx(
    "box-sizing:border-box;border:1px solid " + C.line + ";border-radius:10px;padding:9px 12px;font-family:inherit;font-size:14px;font-weight:700;color:" + C.ink + ";outline:none;width:90px;text-align:center"
  );

  return (
    <div style={sx("display:flex;flex-direction:column;gap:18px;max-width:980px")}>
      {/* 悪天候基準値 */}
      <section style={sx(card + "padding:20px 22px")}>
        <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M5 16a4 4 0 0 1 .5-8 5.5 5.5 0 0 1 10.6-1.3A3.8 3.8 0 0 1 18 14" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 13l-2 4h3l-2 4" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
          悪天候の基準値（自動アラート判定）
        </div>
        <div style={sx(label + "margin:4px 0 16px")}>
          OpenWeather連携値がこの基準を超えた場合、ダッシュボードに警報を表示します
        </div>
        <div style={sx("display:flex;gap:30px;flex-wrap:wrap;align-items:flex-end")}>
          <div>
            <div style={sx(label + "margin-bottom:6px")}>波高の上限（m）</div>
            <div style={sx("display:flex;align-items:center;gap:10px")}>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={waveMax}
                onChange={(e) => { setWaveMax(Number(e.target.value)); setSaved(false); }}
                style={{ width: 180 }}
              />
              <input
                style={inputStyle}
                type="number"
                step={0.1}
                value={waveMax}
                onChange={(e) => { setWaveMax(Number(e.target.value)); setSaved(false); }}
              />
            </div>
          </div>
          <div>
            <div style={sx(label + "margin-bottom:6px")}>風速の上限（m/s）</div>
            <div style={sx("display:flex;align-items:center;gap:10px")}>
              <input
                type="range"
                min={3}
                max={25}
                step={1}
                value={windMax}
                onChange={(e) => { setWindMax(Number(e.target.value)); setSaved(false); }}
                style={{ width: 180 }}
              />
              <input
                style={inputStyle}
                type="number"
                value={windMax}
                onChange={(e) => { setWindMax(Number(e.target.value)); setSaved(false); }}
              />
            </div>
          </div>
          <label style={sx("display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;font-weight:700;padding-bottom:6px")}>
            <input type="checkbox" checked={autoAlert} onChange={(e) => { setAutoAlert(e.target.checked); setSaved(false); }} />
            基準超過で自動リスケ案内を提案
          </label>
        </div>
        <div style={sx("margin-top:14px;background:#FFF8F1;border-radius:10px;padding:10px 13px;font-size:12px;color:#9A5B2E")}>
          現在の判定: 波高 <b>{waveMax.toFixed(1)}m</b> ・ 風速 <b>{windMax}m/s</b> 超で警報{autoAlert ? "（自動案内オン）" : "（手動確認）"}
        </div>
      </section>

      {/* 通知テンプレート */}
      <section style={sx(card + "padding:20px 22px")}>
        <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v12H7l-3 3V5Z" stroke="#0E8FC9" stroke-width="2" stroke-linejoin="round"/></svg>' />
          通知テンプレート
        </div>
        <div style={sx(label + "margin:4px 0 16px")}>
          {"{time} {tour} {meet} {map} {link} {review} {wave} {wind}"} の差込変数が使えます
        </div>
        <div style={sx("display:flex;flex-direction:column;gap:14px")}>
          {templates.map((t, i) => (
            <div key={t.id}>
              <div style={sx("display:flex;align-items:center;gap:8px;margin-bottom:6px")}>
                <Html html={pill(t.k, C.deep, "#E3F2FB")} />
              </div>
              <textarea
                value={t.v}
                onChange={(e) => {
                  setSaved(false);
                  setTemplates((prev) => prev.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)));
                }}
                style={{
                  ...sx(
                    "width:100%;box-sizing:border-box;border:1px solid " + C.line + ";border-radius:11px;padding:11px 13px;font-family:inherit;font-size:13px;color:" + C.ink + ";outline:none;resize:vertical;line-height:1.6"
                  ),
                  minHeight: 56,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ユーザー権限 */}
      <section style={sx(card + "padding:20px 22px")}>
        <div style={sx(h2 + "display:flex;align-items:center;gap:9px")}>
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="#16A34A" stroke-width="2"/><path d="M5 20a7 7 0 0 1 14 0" stroke="#16A34A" stroke-width="2" stroke-linecap="round"/></svg>' />
          ユーザー権限
        </div>
        <div style={sx(label + "margin:4px 0 16px")}>役割ごとに操作できる範囲を制御します</div>
        <div className="r-scroll">
        <div className="r-twwrap">
        <div
          style={sx(
            "display:grid;grid-template-columns:1.4fr 1.2fr repeat(4,.8fr);gap:10px;padding:0 6px 10px;font-size:11px;font-weight:700;color:" + C.sub
          )}
        >
          <div>ユーザー</div>
          <div>役割</div>
          {Object.values(ROLE_LABELS).map((l) => (
            <div key={l} style={sx("text-align:center")}>
              {l}
            </div>
          ))}
        </div>
        {roles.map((r) => (
          <div
            key={r.id}
            style={sx(
              "display:grid;grid-template-columns:1.4fr 1.2fr repeat(4,.8fr);gap:10px;align-items:center;padding:11px 6px;border-bottom:1px solid #F0F5F8"
            )}
          >
            <div style={sx("font-weight:700;font-size:13px")}>{r.name}</div>
            <div style={sx("font-size:12px;color:" + C.sub)}>{r.role}</div>
            {(Object.keys(ROLE_LABELS) as (keyof RoleRow["perms"])[]).map((k) => (
              <div key={k} style={sx("text-align:center")}>
                <span
                  onClick={() => togglePerm(r.id, k)}
                  style={sx(
                    "display:inline-flex;width:40px;height:23px;border-radius:13px;cursor:pointer;align-items:center;padding:2px;transition:.15s;background:" +
                      (r.perms[k] ? C.green : "#D5DEE6") +
                      ";justify-content:" +
                      (r.perms[k] ? "flex-end" : "flex-start")
                  )}
                >
                  <span style={sx("width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)")} />
                </span>
              </div>
            ))}
          </div>
        ))}
        </div>
        </div>
      </section>

      <div style={sx("display:flex;align-items:center;gap:14px")}>
        <button
          onClick={() => setSaved(true)}
          style={sx(btn(saved ? C.green : C.blue, "#fff") + "display:flex;align-items:center;gap:8px")}
        >
          <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 4h11l3 3v13H5V4Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M8 4v5h7M8 14h8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
          {saved ? "✓ 設定を保存しました" : "設定を保存"}
        </button>
        {saved ? <span style={sx("font-size:12px;color:" + C.green + ";font-weight:700")}>すべての変更が反映されました</span> : null}
      </div>
    </div>
  );
}
