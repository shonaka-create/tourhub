"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, pill } from "@/lib/theme";
import { Html } from "../Html";

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

export function SalesModule() {
  const [range, setRange] = useState<(typeof RANGES)[number]>("今週");

  const thisTotal = THIS_WEEK.reduce((a, b) => a + b, 0);
  const lastTotal = LAST_WEEK.reduce((a, b) => a + b, 0);
  const wow = Math.round(((thisTotal - lastTotal) / lastTotal) * 100);

  const today = THIS_WEEK[THIS_WEEK.length - 1];
  const todayPrev = LAST_WEEK[LAST_WEEK.length - 1];
  const todayWow = Math.round(((today - todayPrev) / todayPrev) * 100);

  const chTotal = CHANNELS.reduce((a, c) => a + c.amount, 0);
  const max = Math.max(...THIS_WEEK, ...LAST_WEEK);

  const headline =
    range === "本日" ? today : range === "今週" ? thisTotal : Math.round(thisTotal * 4.3);
  const headlineWow = range === "本日" ? todayWow : wow;

  const kpis = [
    {
      k: range + "の売上",
      v: "$" + headline.toLocaleString(),
      d: (headlineWow >= 0 ? "▲ " : "▼ ") + Math.abs(headlineWow) + "% 前週比",
      c: headlineWow >= 0 ? C.green : C.red,
    },
    { k: "客単価", v: "$" + Math.round(today / 24), d: "本日 24組", c: C.sub },
    { k: "予約件数", v: CHANNELS.reduce((a, c) => a + c.count, 0) + "件", d: "確定ベース", c: C.sub },
    { k: "未収金", v: "$640", d: "3件 要回収", c: C.amber },
  ];

  return (
    <div style={sx("display:flex;flex-direction:column;gap:18px")}>
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
      <div style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:14px")}>
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

      <div style={sx("display:grid;grid-template-columns:1.5fr 1fr;gap:18px;align-items:start")}>
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
              const th = (THIS_WEEK[i] / max) * 100;
              const lh = (LAST_WEEK[i] / max) * 100;
              const up = THIS_WEEK[i] >= LAST_WEEK[i];
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
                      title={"当週 $" + THIS_WEEK[i]}
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
