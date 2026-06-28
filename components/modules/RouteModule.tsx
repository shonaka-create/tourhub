"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";

interface Pickup {
  h: string;
  t: string;
  pax: number;
  tour: string;
  lat: number;
  lng: number;
  done: boolean;
}

// 6/28 AM 送迎データ（ホテル座標は Gold Coast 実在エリアの概算）
const PICKUPS: Pickup[] = [
  { h: "Hilton Surfers Paradise", t: "07:10", pax: 6, tour: "スノーケル", lat: -28.0008, lng: 153.4302, done: true },
  { h: "Marriott Resort", t: "07:20", pax: 4, tour: "スノーケル", lat: -27.9899, lng: 153.4239, done: true },
  { h: "Q1 Resort & Spa", t: "07:35", pax: 5, tour: "パラセーリング", lat: -28.0058, lng: 153.4295, done: false },
  { h: "Mantra on View", t: "07:45", pax: 3, tour: "パラセーリング", lat: -28.0021, lng: 153.4288, done: false },
  { h: "Peppers Broadbeach", t: "08:00", pax: 6, tour: "ジェットスキー", lat: -28.0289, lng: 153.4316, done: false },
];

const TOURS = ["全ツアー", "スノーケル", "パラセーリング", "ジェットスキー"];

export function RouteModule() {
  const [tour, setTour] = useState("全ツアー");
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locState, setLocState] = useState<"idle" | "loading" | "error">("idle");

  const list = PICKUPS.filter((p) => tour === "全ツアー" || p.tour === tour);
  const totalPax = list.reduce((s, p) => s + p.pax, 0);
  const hotels = new Set(list.map((p) => p.h)).size;

  function locate() {
    if (!("geolocation" in navigator)) {
      setLocState("error");
      return;
    }
    setLocState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocState("idle");
      },
      () => setLocState("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // OpenStreetMap（無料・APIキー不要）の埋め込みURL
  const center = loc ?? { lat: -28.0023, lng: 153.4145 };
  const d = 0.03;
  const bbox = [center.lng - d, center.lat - d, center.lng + d, center.lat + d].join("%2C");
  const mapSrc =
    "https://www.openstreetmap.org/export/embed.html?bbox=" +
    bbox +
    "&layer=mapnik" +
    (loc ? "&marker=" + loc.lat + "%2C" + loc.lng : "");

  return (
    <>
      {/* TOUR SWITCHER */}
      <div style={sx("display:flex;flex-wrap:wrap;gap:9px;margin-bottom:16px")}>
        {TOURS.map((t) => {
          const on = t === tour;
          const n = PICKUPS.filter((p) => t === "全ツアー" || p.tour === t).length;
          return (
            <div
              key={t}
              onClick={() => setTour(t)}
              style={sx(
                "padding:9px 16px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;" +
                  (on ? "background:" + C.blue + ";color:#fff" : "background:" + C.soft + ";color:" + C.sub)
              )}
            >
              {t} <span style={sx("opacity:.7;font-size:11px")}>({n})</span>
            </div>
          );
        })}
      </div>

      <div style={sx("display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:start")}>
        {/* LEFT: pickup list */}
        <section style={sx(card + "padding:18px 20px")}>
          <div style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:6px")}>
            <div style={sx(h2)}>本日の送迎リスト（6/28 AM） — {tour}</div>
            <div style={sx("font-size:12px;color:" + C.sub)}>
              対象 <b style={sx("color:" + C.ink)}>{hotels}ホテル / {totalPax}名</b>
            </div>
          </div>
          <div style={sx(label + "margin-bottom:6px")}>ピックアップ対象をツアー別・日別に自動集計</div>
          {list.map((p, i) => (
            <div
              key={i}
              style={sx("display:flex;align-items:center;gap:14px;padding:13px 4px;border-bottom:1px solid #F0F5F8")}
            >
              <div
                className="font-outfit"
                style={sx("width:46px;font-weight:700;font-size:13px;color:" + (p.done ? C.sub : C.blue))}
              >
                {p.t}
              </div>
              <div
                style={sx(
                  "width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:" +
                    (p.done ? "#E4F6EC" : "#E3F2FB")
                )}
              >
                <Html
                  html={
                    p.done
                      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="' +
                        C.green +
                        '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                      : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" stroke="' +
                        C.blue +
                        '" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.4" stroke="' +
                        C.blue +
                        '" stroke-width="2"/></svg>'
                  }
                />
              </div>
              <div style={sx("flex:1")}>
                <div style={sx("font-weight:700;font-size:13px")}>{p.h}</div>
                <div style={sx("font-size:11px;color:" + C.sub)}>{p.tour}</div>
              </div>
              <div className="font-outfit" style={sx("font-weight:700;font-size:14px")}>
                {p.pax}名
              </div>
              <Html html={p.done ? pill("乗車済", C.green, "#E4F6EC") : pill("待機", C.blue, "#E3F2FB")} />
            </div>
          ))}
        </section>

        {/* RIGHT: live map + driver location */}
        <section style={sx(card + "padding:18px 20px")}>
          <div style={sx(h2 + "font-size:14px;margin-bottom:4px;display:flex;align-items:center;gap:8px")}>
            <Html html='<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" stroke="#0E8FC9" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="9" r="2.4" stroke="#0E8FC9" stroke-width="2"/></svg>' />
            ドライバー現在地（無料MAP / OpenStreetMap）
          </div>
          <div style={sx(label + "margin-bottom:12px")}>
            ドライバーのスマホで「現在地を取得」を押すと地図に反映されます
          </div>

          <div style={sx("position:relative;height:300px;border-radius:14px;overflow:hidden;border:1px solid " + C.line)}>
            <iframe
              key={mapSrc}
              title="driver-map"
              src={mapSrc}
              style={{ width: "100%", height: "100%", border: 0 }}
            />
            {loc ? (
              <div
                style={sx(
                  "position:absolute;left:10px;top:10px;background:#fff;border-radius:10px;padding:7px 11px;font-size:11px;box-shadow:0 4px 12px rgba(0,0,0,.12)"
                )}
              >
                <b style={sx("color:" + C.blue)}>現在地</b>{" "}
                <span style={sx("color:" + C.sub)}>
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </span>
              </div>
            ) : null}
          </div>

          <button
            onClick={locate}
            style={sx(
              btn(C.blue, "#fff") + "width:100%;margin-top:14px;display:flex;align-items:center;justify-content:center;gap:8px"
            )}
          >
            <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="#fff" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
            {locState === "loading" ? "取得中…" : loc ? "現在地を更新" : "現在地を取得"}
          </button>
          {locState === "error" ? (
            <div style={sx("margin-top:10px;font-size:11px;color:" + C.red + ";text-align:center")}>
              位置情報を取得できませんでした（ブラウザの許可をご確認ください）
            </div>
          ) : null}

          <a
            href={
              "https://www.google.com/maps/dir/" +
              (loc ? loc.lat + "," + loc.lng + "/" : "") +
              list.map((p) => p.lat + "," + p.lng).join("/")
            }
            target="_blank"
            rel="noreferrer"
            style={sx(
              btn(C.soft, C.deep) + "width:100%;margin-top:9px;box-sizing:border-box;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:8px"
            )}
          >
            <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="#0A5688" stroke-width="2" stroke-linejoin="round"/></svg>' />
            Google Mapsでルートを開く
          </a>
        </section>
      </div>
    </>
  );
}
