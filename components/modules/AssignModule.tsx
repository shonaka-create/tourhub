"use client";

import { useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, pill } from "@/lib/theme";
import { Html } from "../Html";

interface Guide {
  id: string;
  name: string;
  tag?: string;
}
interface Van {
  id: string;
  name: string;
  cap: number;
}
interface Tour {
  id: string;
  name: string;
  time: string;
  pax: number;
  plan: string;
  guides: { id: string; name: string }[];
  vans: { id: string; name: string; cap: number }[];
  needEquip: string;
}

const POOL_GUIDES: Guide[] = [
  { id: "g1", name: "K. Lee", tag: "スノーケル" },
  { id: "g2", name: "M. Tan", tag: "ジェットスキー" },
  { id: "g3", name: "J. Park", tag: "バイク" },
  { id: "g4", name: "A. Wong", tag: "SUP" },
];
const POOL_VANS: Van[] = [
  { id: "v2", name: "バン #2", cap: 12 },
  { id: "v4", name: "バン #4", cap: 14 },
  { id: "v7", name: "バン #7", cap: 8 },
];
const INITIAL_TOURS: Tour[] = [
  { id: "t1", name: "パラセーリング 第1便", time: "09:30", pax: 12, plan: "パラセーリング", guides: [], vans: [], needEquip: "ライフジャケット ×12" },
  { id: "t2", name: "ジェットスキー体験", time: "11:00", pax: 8, plan: "ジェットスキー", guides: [{ id: "g2", name: "M. Tan" }], vans: [], needEquip: "ウェットスーツ ×8" },
  { id: "t3", name: "シティ・バイクツアー", time: "14:00", pax: 14, plan: "サイクリング", guides: [], vans: [], needEquip: "自転車 ×14" },
];

type DragData = { type: "guide" | "van"; id: string };

export function AssignModule() {
  const [tours, setTours] = useState<Tour[]>(INITIAL_TOURS);
  const [drag, setDrag] = useState<DragData | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  function drop(tid: string) {
    setHover(null);
    if (!drag) return;
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tid) return t;
        if (drag.type === "guide") {
          const g = POOL_GUIDES.find((x) => x.id === drag.id);
          if (g && !t.guides.some((x) => x.id === g.id))
            return { ...t, guides: [...t.guides, { id: g.id, name: g.name }] };
        } else {
          const v = POOL_VANS.find((x) => x.id === drag.id);
          if (v && !t.vans.some((x) => x.id === v.id))
            return { ...t, vans: [...t.vans, { id: v.id, name: v.name, cap: v.cap }] };
        }
        return t;
      })
    );
    setDrag(null);
  }

  function removeAssigned(tid: string, kind: "guide" | "van", id: string) {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id !== tid) return t;
        return kind === "guide"
          ? { ...t, guides: t.guides.filter((x) => x.id !== id) }
          : { ...t, vans: t.vans.filter((x) => x.id !== id) };
      })
    );
  }

  const chip = (item: Guide | Van, type: "guide" | "van") => {
    const sub = type === "van" ? "定員 " + (item as Van).cap : (item as Guide).tag;
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => {
          setDrag({ type, id: item.id });
          e.dataTransfer.effectAllowed = "copy";
        }}
        style={sx(
          "display:flex;align-items:center;gap:9px;background:#fff;border:1px solid " +
            C.line +
            ";border-radius:11px;padding:9px 11px;cursor:grab;user-select:none"
        )}
      >
        <span
          style={sx(
            "width:30px;height:30px;border-radius:8px;background:" +
              (type === "van" ? "#E4F6EC" : "#E3F2FB") +
              ";display:flex;align-items:center;justify-content:center;font-family:Outfit;font-weight:700;font-size:12px;color:" +
              (type === "van" ? C.green : C.blue)
          )}
        >
          {type === "van" ? "🚐" : item.name.charAt(0)}
        </span>
        <div>
          <div style={sx("font-weight:700;font-size:13px")}>{item.name}</div>
          <div style={sx("font-size:10px;color:" + C.sub)}>{sub}</div>
        </div>
      </div>
    );
  };

  return (
    <div style={sx("display:grid;grid-template-columns:280px 1fr;gap:18px;align-items:start")}>
      {/* POOL */}
      <section style={sx(card + "padding:16px 16px 18px")}>
        <div style={sx(h2 + "font-size:14px;margin-bottom:4px")}>利用可能スタッフ</div>
        <div style={sx(label + "margin-bottom:11px")}>ツアーへドラッグして割当</div>
        <div style={sx("display:flex;flex-direction:column;gap:9px")}>
          {POOL_GUIDES.map((g) => chip(g, "guide"))}
        </div>
        <div style={sx(h2 + "font-size:14px;margin:18px 0 11px")}>利用可能車両</div>
        <div style={sx("display:flex;flex-direction:column;gap:9px")}>
          {POOL_VANS.map((v) => chip(v, "van"))}
        </div>
      </section>

      {/* TOURS */}
      <div style={sx("display:flex;flex-direction:column;gap:14px")}>
        {tours.map((t) => {
          const vanCap = t.vans.reduce((s, v) => s + v.cap, 0);
          const noGuide = t.guides.length === 0;
          const overCap = t.vans.length > 0 && vanCap < t.pax;
          const warn: string[] = [];
          if (noGuide) warn.push("ガイド未割当");
          if (overCap) warn.push("車両定員オーバー（" + vanCap + "<" + t.pax + "）");
          if (t.vans.length === 0) warn.push("車両未割当");
          const ok = warn.length === 0;
          return (
            <div
              key={t.id}
              onDragOver={(e) => {
                e.preventDefault();
                setHover(t.id);
              }}
              onDragLeave={() => setHover((h) => (h === t.id ? null : h))}
              onDrop={(e) => {
                e.preventDefault();
                drop(t.id);
              }}
              style={{
                ...sx(
                  card +
                    "border-color:" +
                    (ok ? "#CFE9D8" : "#F3D2D2") +
                    ";padding:15px 16px;transition:.15s"
                ),
                boxShadow: hover === t.id ? "0 0 0 3px rgba(14,143,201,.3)" : "none",
              }}
            >
              <div style={sx("display:flex;align-items:center;gap:10px;margin-bottom:10px")}>
                <div
                  className="font-outfit"
                  style={sx("font-weight:700;font-size:15px;color:" + C.blue)}
                >
                  {t.time}
                </div>
                <div style={sx("font-weight:800;font-size:14px;flex:1")}>{t.name}</div>
                <Html
                  html={
                    ok
                      ? pill("割当完了", C.green, "#E4F6EC")
                      : pill("要対応 " + warn.length, C.red, "#FDEBEB")
                  }
                />
              </div>
              <div
                style={sx(
                  "display:flex;gap:18px;font-size:11px;color:" + C.sub + ";margin-bottom:12px"
                )}
              >
                <span>
                  予約 <b style={sx("color:" + C.ink)}>{t.pax}名</b>
                </span>
                <span>
                  プラン <b style={sx("color:" + C.ink)}>{t.plan}</b>
                </span>
                <span>
                  必要機材 <b style={sx("color:" + C.ink)}>{t.needEquip}</b>
                </span>
              </div>
              <div
                style={sx(
                  "display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-height:38px;background:" +
                    C.soft +
                    ";border-radius:12px;border:1.5px dashed #C9DCE8;padding:9px 11px"
                )}
              >
                {t.guides.length === 0 && t.vans.length === 0 ? (
                  <span style={sx("font-size:12px;color:#9DB4C4")}>
                    ここにスタッフ・車両をドロップ
                  </span>
                ) : (
                  <>
                    {t.guides.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => removeAssigned(t.id, "guide", g.id)}
                        style={sx(
                          "display:flex;align-items:center;gap:6px;background:#E3F2FB;color:" +
                            C.deep +
                            ";border-radius:9px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer"
                        )}
                      >
                        {g.name} ✕
                      </div>
                    ))}
                    {t.vans.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => removeAssigned(t.id, "van", v.id)}
                        style={sx(
                          "display:flex;align-items:center;gap:6px;background:#E4F6EC;color:" +
                            C.green +
                            ";border-radius:9px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer"
                        )}
                      >
                        {v.name} ✕
                      </div>
                    ))}
                  </>
                )}
              </div>
              {warn.length ? (
                <div
                  style={sx(
                    "margin-top:10px;display:flex;align-items:center;gap:8px;font-size:12px;color:" +
                      C.red +
                      ";background:#FDEBEB;padding:8px 12px;border-radius:10px"
                  )}
                >
                  <Html
                    html={
                      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3l9 16H3l9-16Z" stroke="' +
                      C.red +
                      '" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4M12 16h.01" stroke="' +
                      C.red +
                      '" stroke-width="2" stroke-linecap="round"/></svg>'
                    }
                  />
                  {warn.join(" ・ ")}
                </div>
              ) : (
                <div
                  style={sx(
                    "margin-top:10px;display:flex;align-items:center;gap:8px;font-size:12px;color:" +
                      C.green +
                      ";background:#E4F6EC;padding:8px 12px;border-radius:10px"
                  )}
                >
                  <Html
                    html={
                      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5 9-11" stroke="' +
                      C.green +
                      '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    }
                  />
                  リソース自動チェック OK ・ 出発準備完了
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
