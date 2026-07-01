"use client";

import { useEffect, useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, pill } from "@/lib/theme";
import { Html } from "../Html";
import { fetchMembers, JOB_LABELS } from "@/lib/members";

type Cat = "guide" | "van" | "equip";

interface Resource {
  id: string;
  name: string;
  sub: string; // 補足（タグ・定員・数量など）
}

interface Assigned {
  id: string;
  name: string;
  cat: Cat;
}

interface Tour {
  id: string;
  name: string;
  time: string;
  pax: number;
  plan: string;
  needEquip: string;
  assigned: Assigned[];
}

const CAT_META: Record<Cat, { title: string; emoji: string; bg: string; col: string }> = {
  guide: { title: "スタッフ（人）", emoji: "🧑", bg: "#E3F2FB", col: C.blue },
  van: { title: "車両", emoji: "🚐", bg: "#E4F6EC", col: C.green },
  equip: { title: "機材", emoji: "🤿", bg: "#FFF1DC", col: C.amber },
};

const INITIAL_POOLS: Record<Cat, Resource[]> = {
  guide: [
    { id: "g1", name: "K. Lee", sub: "スノーケル" },
    { id: "g2", name: "M. Tan", sub: "ジェットスキー" },
    { id: "g3", name: "J. Park", sub: "バイク" },
    { id: "g4", name: "A. Wong", sub: "SUP" },
  ],
  van: [
    { id: "v2", name: "バン #2", sub: "定員 12" },
    { id: "v4", name: "バン #4", sub: "定員 14" },
    { id: "v7", name: "バン #7", sub: "定員 8" },
  ],
  equip: [
    { id: "e1", name: "ライフジャケット ×20", sub: "保護具" },
    { id: "e2", name: "ウェットスーツ ×12", sub: "保護具" },
    { id: "e3", name: "シティバイク ×8", sub: "車両機材" },
    { id: "e4", name: "シュノーケルセット ×18", sub: "備品" },
  ],
};

const INITIAL_TOURS: Tour[] = [
  { id: "t1", name: "パラセーリング 第1便", time: "09:30", pax: 12, plan: "パラセーリング", needEquip: "ライフジャケット ×12", assigned: [] },
  { id: "t2", name: "ジェットスキー体験", time: "11:00", pax: 8, plan: "ジェットスキー", needEquip: "ウェットスーツ ×8", assigned: [{ id: "g2", name: "M. Tan", cat: "guide" }] },
  { id: "t3", name: "シティ・バイクツアー", time: "14:00", pax: 14, plan: "サイクリング", needEquip: "自転車 ×14", assigned: [] },
];

export function AssignModule() {
  const [pools, setPools] = useState<Record<Cat, Resource[]>>(INITIAL_POOLS);
  const [tours, setTours] = useState<Tour[]>(INITIAL_TOURS);
  const [drag, setDrag] = useState<{ cat: Cat; id: string } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [addCat, setAddCat] = useState<Cat | null>(null);
  const [addForm, setAddForm] = useState({ name: "", sub: "" });
  // スタッフ（人）プールを実データ（profiles）から取得できたか
  const [staffLinked, setStaffLinked] = useState(false);

  // 組織の実スタッフ（ガイド/ドライバー）を「スタッフ（人）」プールに反映。
  // これにより割当が実ユーザー(user_id)を参照し、便グループの自動招集につながる。
  useEffect(() => {
    let active = true;
    fetchMembers()
      .then((members) => {
        const field = members.filter((m) => m.active && (m.job === "guide" || m.job === "driver"));
        if (!active || field.length === 0) return; // 未ログイン/スタッフ未登録時はデモのまま
        setPools((p) => ({
          ...p,
          guide: field.map((m) => ({ id: m.userId, name: m.displayName || "（無名）", sub: JOB_LABELS[m.job] })),
        }));
        setStaffLinked(true);
      })
      .catch(() => {
        /* 未ログイン等はデモのプールを使用 */
      });
    return () => {
      active = false;
    };
  }, []);

  // ドラッグ＆ドロップ・ドロップダウン選択 共通の割当処理
  function assign(tid: string, cat: Cat, id: string) {
    const res = pools[cat].find((r) => r.id === id);
    if (!res) return;
    setTours((prev) =>
      prev.map((t) =>
        t.id === tid && !t.assigned.some((a) => a.id === res.id && a.cat === cat)
          ? { ...t, assigned: [...t.assigned, { id: res.id, name: res.name, cat }] }
          : t
      )
    );
  }

  function drop(tid: string) {
    setHover(null);
    if (!drag) return;
    assign(tid, drag.cat, drag.id);
    setDrag(null);
  }

  function removeAssigned(tid: string, cat: Cat, id: string) {
    setTours((prev) =>
      prev.map((t) =>
        t.id === tid
          ? { ...t, assigned: t.assigned.filter((a) => !(a.id === id && a.cat === cat)) }
          : t
      )
    );
  }

  function addResource() {
    if (!addCat || !addForm.name.trim()) return;
    const cat = addCat;
    setPools((prev) => ({
      ...prev,
      [cat]: [...prev[cat], { id: cat + Date.now(), name: addForm.name.trim(), sub: addForm.sub.trim() || "—" }],
    }));
    setAddForm({ name: "", sub: "" });
    setAddCat(null);
  }

  const chip = (cat: Cat, item: Resource) => {
    const meta = CAT_META[cat];
    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => {
          setDrag({ cat, id: item.id });
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
              meta.bg +
              ";display:flex;align-items:center;justify-content:center;font-family:Outfit;font-weight:700;font-size:12px;color:" +
              meta.col
          )}
        >
          {cat === "guide" ? item.name.charAt(0) : meta.emoji}
        </span>
        <div style={sx("min-width:0")}>
          <div style={sx("font-weight:700;font-size:13px")}>{item.name}</div>
          <div style={sx("font-size:10px;color:" + C.sub)}>{item.sub}</div>
        </div>
      </div>
    );
  };

  const inputStyle = sx(
    "width:100%;box-sizing:border-box;border:1px solid " +
      C.line +
      ";border-radius:9px;padding:8px 10px;font-family:inherit;font-size:12px;outline:none"
  );

  const poolSection = (cat: Cat) => {
    const meta = CAT_META[cat];
    return (
      <div>
        <div style={sx("display:flex;align-items:center;justify-content:space-between;margin:0 0 9px")}>
          <div style={sx(h2 + "font-size:14px")}>{meta.title}</div>
          <button
            onClick={() => {
              setAddCat((c) => (c === cat ? null : cat));
              setAddForm({ name: "", sub: "" });
            }}
            style={sx(
              "border:none;background:" +
                meta.bg +
                ";color:" +
                meta.col +
                ";font-family:inherit;font-weight:700;font-size:11px;padding:5px 9px;border-radius:8px;cursor:pointer"
            )}
          >
            ＋ 追加
          </button>
        </div>
        {addCat === cat ? (
          <div
            style={sx(
              "background:" + C.soft + ";border-radius:11px;padding:10px;margin-bottom:10px;display:flex;flex-direction:column;gap:7px"
            )}
          >
            <input
              style={inputStyle}
              autoFocus
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder={cat === "guide" ? "氏名" : cat === "van" ? "車両名" : "機材名 ×数量"}
            />
            <input
              style={inputStyle}
              value={addForm.sub}
              onChange={(e) => setAddForm({ ...addForm, sub: e.target.value })}
              placeholder={cat === "guide" ? "得意ツアー" : cat === "van" ? "定員 12" : "分類"}
            />
            <button
              onClick={addResource}
              style={sx(
                "border:none;background:" + meta.col + ";color:#fff;font-family:inherit;font-weight:700;font-size:12px;padding:8px;border-radius:9px;cursor:pointer"
              )}
            >
              リストに追加
            </button>
          </div>
        ) : null}
        <div style={sx("display:flex;flex-direction:column;gap:9px")}>
          {pools[cat].map((r) => chip(cat, r))}
        </div>
      </div>
    );
  };

  return (
    <div className="r-split" style={sx("display:grid;grid-template-columns:280px 1fr;gap:18px;align-items:start")}>
      {/* POOL */}
      <section style={sx(card + "padding:16px 16px 18px;display:flex;flex-direction:column;gap:18px")}>
        <div style={sx(label)}>
          ツアーへドラッグ、または各ツアーのメニューから選択して割当 ・ ＋で項目を追加
        </div>
        {staffLinked ? (
          <div style={sx("font-size:11px;color:" + C.green + ";font-weight:700;margin-top:2px")}>
            スタッフ（人）は組織メンバーと連携済み（設定＞メンバーで職種を管理）
          </div>
        ) : null}
        {poolSection("guide")}
        {poolSection("van")}
        {poolSection("equip")}
      </section>

      {/* TOURS */}
      <div style={sx("display:flex;flex-direction:column;gap:14px")}>
        {tours.map((t) => {
          const guides = t.assigned.filter((a) => a.cat === "guide");
          const vans = t.assigned.filter((a) => a.cat === "van");
          const equips = t.assigned.filter((a) => a.cat === "equip");
          const warn: string[] = [];
          if (guides.length === 0) warn.push("ガイド未割当");
          if (vans.length === 0) warn.push("車両未割当");
          if (equips.length === 0) warn.push("機材未割当");
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
                <div className="font-outfit" style={sx("font-weight:700;font-size:15px;color:" + C.blue)}>
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
              <div className="r-wrap" style={sx("display:flex;gap:18px;font-size:11px;color:" + C.sub + ";margin-bottom:12px")}>
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
                {t.assigned.length === 0 ? (
                  <span style={sx("font-size:12px;color:#9DB4C4")}>
                    ドラッグ＆ドロップ、または下のメニューから選択して割当
                  </span>
                ) : (
                  t.assigned.map((a) => {
                    const meta = CAT_META[a.cat];
                    return (
                      <div
                        key={a.cat + a.id}
                        onClick={() => removeAssigned(t.id, a.cat, a.id)}
                        style={sx(
                          "display:flex;align-items:center;gap:6px;background:" +
                            meta.bg +
                            ";color:" +
                            meta.col +
                            ";border-radius:9px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer"
                        )}
                      >
                        {meta.emoji} {a.name} ✕
                      </div>
                    );
                  })
                )}
              </div>

              {/* ドロップダウン選択（モバイル・タッチ環境向けの割当手段） */}
              <select
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [cat, id] = e.target.value.split("|") as [Cat, string];
                  assign(t.id, cat, id);
                  e.target.value = "";
                }}
                style={sx(
                  "margin-top:9px;width:100%;box-sizing:border-box;border:1px solid " +
                    C.line +
                    ";border-radius:10px;padding:9px 11px;font-family:inherit;font-size:13px;color:" +
                    C.ink +
                    ";background:#fff;cursor:pointer;outline:none"
                )}
              >
                <option value="">＋ 人・車・機材を選択して割当…</option>
                {(["guide", "van", "equip"] as Cat[]).map((cat) => {
                  const avail = pools[cat].filter(
                    (r) => !t.assigned.some((a) => a.id === r.id && a.cat === cat)
                  );
                  if (avail.length === 0) return null;
                  return (
                    <optgroup key={cat} label={CAT_META[cat].title}>
                      {avail.map((r) => (
                        <option key={r.id} value={cat + "|" + r.id}>
                          {r.name}
                          {r.sub ? "（" + r.sub + "）" : ""}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>

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
                  人・車・機材の割当 OK ・ 出発準備完了
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
