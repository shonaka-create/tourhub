"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { Html } from "./Html";

interface Weather {
  updatedAt: string;
  temp: number;
  feels: number;
  humidity: number;
  condition: string;
  wind: number;
  windDir: string;
  windStrong: boolean;
  uv: number;
  uvText: string;
  wave: number | null;
  waveOver: boolean;
}

// 取得失敗・読み込み中のフォールバック（参考値）
const FALLBACK: Weather = {
  updatedAt: "--:--",
  temp: 24,
  feels: 26,
  humidity: 68,
  condition: "—",
  wind: 14,
  windDir: "南東",
  windStrong: true,
  uv: 8,
  uvText: "非常に強い",
  wave: 2.4,
  waveOver: true,
};

function tile(label: string, body: React.ReactNode) {
  return (
    <div style={sx("background:rgba(255,255,255,.14);backdrop-filter:blur(4px);border-radius:12px;padding:11px 12px")}>
      <div style={sx("font-size:11px;color:#CDEFFB")}>{label}</div>
      {body}
    </div>
  );
}

export function WeatherHero() {
  const [w, setW] = useState<Weather>(FALLBACK);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/weather")
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.ok) {
          setW(d);
          setLive(true);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={sx("position:relative;padding:18px 22px")}>
      <div style={sx("display:flex;justify-content:space-between;align-items:center")}>
        <div style={sx("display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#D6F3FF")}>
          <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2v2m0 16v2M4 12H2m20 0h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" stroke="#FFE08A" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="4.5" fill="#FFE08A"/></svg>' />{" "}
          サーファーズパラダイス沿岸 · ライブ
        </div>
        <span style={sx("font-size:11px;background:rgba(255,255,255,.18);padding:4px 9px;border-radius:20px")}>
          Open-Meteo 連携{live ? " · " + w.updatedAt + "更新" : "…"}
        </span>
      </div>
      <div style={sx("display:flex;align-items:flex-end;gap:20px;margin-top:8px")}>
        <div className="font-outfit" style={sx("font-weight:800;font-size:52px;line-height:1")}>
          {w.temp}°<span style={sx("font-size:22px;opacity:.7")}>C</span>
        </div>
        <div style={sx("padding-bottom:8px;line-height:1.4")}>
          <div style={sx("font-weight:700;font-size:15px")}>{w.condition}</div>
          <div style={sx("font-size:12px;color:#CDEFFB")}>
            体感 {w.feels}° · 湿度 {w.humidity}%
          </div>
        </div>
      </div>
      <div className="r-grid-4" style={sx("display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px")}>
        {tile(
          "風速",
          <>
            <div className="font-outfit" style={sx("font-weight:700;font-size:19px;margin-top:2px")}>
              {w.wind}
              <span style={sx("font-size:11px;opacity:.7")}> m/s</span>
            </div>
            <div style={sx("font-size:10px;color:" + (w.windStrong ? "#FFCFA0" : "#CDEFFB") + ";margin-top:1px")}>
              {w.windDir} · {w.windStrong ? "強め" : "穏やか"}
            </div>
          </>
        )}
        {tile(
          "波高",
          <>
            <div className="font-outfit" style={sx("font-weight:700;font-size:19px;margin-top:2px")}>
              {w.wave != null ? w.wave : "—"}
              {w.wave != null ? <span style={sx("font-size:11px;opacity:.7")}> m</span> : null}
            </div>
            <div style={sx("font-size:10px;color:" + (w.waveOver ? "#FFB4B4" : "#CDEFFB") + ";margin-top:1px")}>
              {w.wave == null ? "取得不可" : w.waveOver ? "基準超過 ⚠" : "安全圏"}
            </div>
          </>
        )}
        {tile(
          "満潮",
          <>
            <div className="font-outfit" style={sx("font-weight:700;font-size:19px;margin-top:2px;opacity:.55")}>
              —
            </div>
            <div style={sx("font-size:10px;color:#CDEFFB;margin-top:1px")}>無料連携対象外</div>
          </>
        )}
        {tile(
          "UV指数",
          <>
            <div className="font-outfit" style={sx("font-weight:700;font-size:19px;margin-top:2px")}>
              {w.uv}
            </div>
            <div style={sx("font-size:10px;color:" + (w.uv >= 8 ? "#FFCFA0" : "#CDEFFB") + ";margin-top:1px")}>
              {w.uvText}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
