"use client";

import { useEffect, useMemo, useState } from "react";
import { sx } from "@/lib/sx";
import { C, card, h2, label, btn, pill } from "@/lib/theme";
import { Html } from "../Html";
import {
  TourSlot,
  fetchTours,
  insertTour,
  updateTour,
  deleteTour,
} from "@/lib/tours";

// デモ運行月・本日（Topbar / 参加者名簿と表記を統一）
const YEAR = 2026;
const MONTH = 5; // 0-indexed = 6月
const TODAY = "2026-06-28";
const DAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

// ツアー名の入力補助（OTA連携前の手動登録向けプリセット）
const TOUR_PRESETS = [
  "モーニング・スノーケル",
  "パラセーリング 第1便",
  "ジェットスキー体験",
  "シティ・バイクツアー",
  "サンライズ・SUP",
];

function ymd(d: number): string {
  return `${YEAR}-${String(MONTH + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function loadColor(pct: number): { col: string; bg: string } {
  if (pct >= 100) return { col: C.red, bg: "#FDEBEB" };
  if (pct >= 85) return { col: C.amber, bg: "#FFF6E8" };
  return { col: C.blue, bg: "#F2FAFE" };
}

const EMPTY_FORM = {
  date: TODAY,
  name: TOUR_PRESETS[0],
  time: "08:00",
  capacity: "12",
  booked: "0",
  manager: "",
  contact: "",
  meet: "",
  note: "",
};

export function BookingModule() {
  const [tours, setTours] = useState<TourSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selDate, setSelDate] = useState(TODAY);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // 初回ロード: Supabase から登録済みのツアー枠を取得
  useEffect(() => {
    let active = true;
    fetchTours()
      .then((rows) => {
        if (active) setTours(rows);
      })
      .catch((e) => {
        if (active) setErr(e?.message ?? "ツアー枠の読み込みに失敗しました");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // 日付ごとの上限枠・予約数を集計（カレンダー表示は登録内容から自動算出）
  const byDate = useMemo(() => {
    const m = new Map<string, { cap: number; booked: number; count: number }>();
    for (const t of tours) {
      const cur = m.get(t.date) ?? { cap: 0, booked: 0, count: 0 };
      cur.cap += t.capacity;
      cur.booked += t.booked;
      cur.count += 1;
      m.set(t.date, cur);
    }
    return m;
  }, [tours]);

  const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
  const leadBlanks = (new Date(YEAR, MONTH, 1).getDay() + 6) % 7; // 月曜始まり

  // 選択日のツアー一覧
  const selTours = useMemo(
    () =>
      tours
        .filter((t) => t.date === selDate)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [tours, selDate]
  );

  function openAdd() {
    setEditId(null);
    setForm({ ...EMPTY_FORM, date: selDate });
    setAdding(true);
  }

  function openEdit(t: TourSlot) {
    setEditId(t.id);
    setForm({
      date: t.date,
      name: t.name,
      time: t.time,
      capacity: String(t.capacity),
      booked: String(t.booked),
      manager: t.manager,
      contact: t.contact,
      meet: t.meet,
      note: t.note,
    });
    setAdding(true);
  }

  async function save() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    setErr(null);
    const payload = {
      date: form.date,
      name: form.name.trim(),
      time: form.time || "08:00",
      capacity: Math.max(0, Number(form.capacity) || 0),
      booked: Math.max(0, Number(form.booked) || 0),
      manager: form.manager.trim(),
      contact: form.contact.trim(),
      meet: form.meet.trim(),
      note: form.note.trim(),
      source: "manual" as const,
    };
    try {
      if (editId) {
        const updated = await updateTour(editId, payload);
        setTours((prev) => prev.map((t) => (t.id === editId ? updated : t)));
      } else {
        const created = await insertTour(payload);
        setTours((prev) => [...prev, created]);
        setSelDate(payload.date);
      }
      setForm({ ...EMPTY_FORM, date: payload.date });
      setAdding(false);
      setEditId(null);
    } catch (e: any) {
      setErr(e?.message ?? "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const prev = tours;
    setTours((cur) => cur.filter((t) => t.id !== id)); // 楽観的に削除
    try {
      await deleteTour(id);
    } catch (e: any) {
      setTours(prev);
      setErr(e?.message ?? "削除に失敗しました");
    }
  }

  const inputStyle = sx(
    "box-sizing:border-box;width:100%;border:1px solid " +
      C.line +
      ";border-radius:10px;padding:9px 11px;font-family:inherit;font-size:13px;color:" +
      C.ink +
      ";outline:none"
  );

  const totalCap = tours.reduce((a, t) => a + t.capacity, 0);
  const totalBooked = tours.reduce((a, t) => a + t.booked, 0);

  return (
    <div style={sx("display:flex;flex-direction:column;gap:18px")}>
      {/* CALENDAR + DAY SLOTS */}
      <div className="r-split" style={sx("display:grid;grid-template-columns:1.1fr .9fr;gap:18px;align-items:start")}>
        {/* CALENDAR */}
        <section style={sx(card + "padding:18px 20px")}>
          <div className="cal-head" style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:14px")}>
            <div style={sx(h2)}>{YEAR}年 {MONTH + 1}月 — 空き枠カレンダー</div>
            <div style={sx("display:flex;gap:14px;font-size:11px;flex-shrink:0;color:" + C.sub)}>
              {[
                ["空きあり", C.blue],
                ["残少", C.amber],
                ["満席", C.red],
              ].map(([t, col]) => (
                <span key={t} style={sx("display:flex;align-items:center;gap:5px")}>
                  <span style={sx("width:9px;height:9px;border-radius:3px;background:" + col)} />
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div style={sx(label + "margin-bottom:10px")}>
            上限枠と予約数の登録内容から、各日の空き状況を自動表示します
          </div>

          <div className="cal-grid" style={sx("display:grid;grid-template-columns:repeat(7,1fr);gap:7px;margin-bottom:7px")}>
            {DAY_LABELS.map((d) => (
              <div key={d} style={sx("text-align:center;font-size:11px;font-weight:700;color:" + C.sub)}>
                {d}
              </div>
            ))}
          </div>
          <div className="cal-grid" style={sx("display:grid;grid-template-columns:repeat(7,1fr);gap:7px")}>
            {Array.from({ length: leadBlanks }).map((_, i) => (
              <div key={"b" + i} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1;
              const date = ymd(d);
              const agg = byDate.get(date);
              const pct = agg && agg.cap > 0 ? Math.round((agg.booked / agg.cap) * 100) : null;
              const full = pct != null && pct >= 100;
              const { col, bg } = pct != null ? loadColor(pct) : { col: C.line, bg: "#fff" };
              const isToday = date === TODAY;
              const isSel = date === selDate;
              return (
                <div
                  key={d}
                  className="cal-cell"
                  onClick={() => setSelDate(date)}
                  style={sx(
                    card +
                      "border-color:" +
                      (isSel ? C.blue : isToday ? "#BFE0F0" : C.line) +
                      ";border-width:" +
                      (isSel || isToday ? 2 : 1) +
                      "px;border-radius:12px;padding:9px 9px 8px;min-height:74px;position:relative;cursor:pointer;" +
                      (isSel ? "box-shadow:0 4px 14px rgba(14,143,201,.18)" : "")
                  )}
                >
                  <div style={sx("display:flex;justify-content:space-between;align-items:center")}>
                    <span className="font-outfit" style={sx("font-weight:700;font-size:13px;color:" + C.ink)}>
                      {d}
                    </span>
                    {isToday ? <Html html={pill("本日", "#fff", C.blue)} /> : null}
                  </div>
                  {agg ? (
                    <>
                      <div style={sx("font-size:10px;color:" + C.sub + ";margin-top:6px")}>
                        予約 {agg.booked}名
                      </div>
                      <div style={sx("display:flex;align-items:center;gap:6px;margin-top:5px")}>
                        <div style={sx("height:6px;background:#EAF0F5;border-radius:5px;overflow:hidden;flex:1")}>
                          <div
                            style={{
                              ...sx("height:100%;border-radius:5px;background:" + col),
                              width: Math.min(100, pct ?? 0) + "%",
                            }}
                          />
                        </div>
                      </div>
                      {full ? (
                        <div style={sx("position:absolute;right:6px;bottom:6px")}>
                          <Html html={pill("満席", C.red, bg)} />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="cal-empty" style={sx("font-size:10px;color:#B7C7D3;margin-top:10px")}>枠未設定</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SELECTED DAY SLOTS */}
        <section style={sx(card + "padding:18px 20px")}>
          <div style={sx("display:flex;align-items:center;justify-content:space-between;margin-bottom:4px")}>
            <div style={sx(h2)}>
              {selDate === TODAY ? "本日" : selDate.slice(5).replace("-", "/")}の空き枠（一元管理）
            </div>
            <button onClick={openAdd} style={sx(btn(C.blue, "#fff") + "padding:8px 13px;font-size:12px;display:flex;align-items:center;gap:6px")}>
              <Html html='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
              枠を登録
            </button>
          </div>
          <div style={sx(label + "margin-bottom:8px")}>定員到達で自動的に受付ブロック・担当管理者を表示</div>

          {selTours.length === 0 ? (
            <div style={sx("border:1.5px dashed #C9DCE8;border-radius:12px;padding:22px;text-align:center;font-size:12px;color:#9DB4C4")}>
              {loading
                ? "Supabase からツアー枠を読み込み中…"
                : "この日のツアー枠は未登録です。「枠を登録」から上限枠・担当管理者を設定してください。"}
            </div>
          ) : (
            selTours.map((t) => {
              const pct = t.capacity > 0 ? Math.round((t.booked / t.capacity) * 100) : 0;
              const full = t.capacity > 0 && t.booked >= t.capacity;
              const col = full ? C.red : pct >= 80 ? C.amber : C.green;
              return (
                <div
                  key={t.id}
                  style={sx("display:flex;align-items:center;gap:14px;padding:13px 4px;border-bottom:1px solid #F0F5F8")}
                >
                  <div className="font-outfit" style={sx("width:46px;font-weight:700;font-size:13px")}>
                    {t.time}
                  </div>
                  <div style={sx("flex:1;min-width:0")}>
                    <div style={sx("font-weight:700;font-size:13px")}>{t.name}</div>
                    <div style={sx("display:flex;align-items:center;gap:10px;margin-top:6px")}>
                      <div style={sx("height:6px;background:#EAF0F5;border-radius:5px;overflow:hidden;flex:1")}>
                        <div style={{ ...sx("height:100%;border-radius:5px;background:" + col), width: Math.min(100, pct) + "%" }} />
                      </div>
                      <span style={sx("font-size:11px;color:" + C.sub + ";width:60px;text-align:right")}>
                        残 {Math.max(0, t.capacity - t.booked)}席
                      </span>
                    </div>
                    {t.manager ? (
                      <div style={sx("font-size:11px;color:" + C.sub + ";margin-top:5px")}>
                        担当 {t.manager}
                        {t.contact ? " ・ " + t.contact : ""}
                        {t.meet ? " ・ 集合 " + t.meet : ""}
                      </div>
                    ) : null}
                  </div>
                  <div className="font-outfit" style={sx("font-weight:700;font-size:14px;width:54px;text-align:right;color:" + col)}>
                    {t.booked}/{t.capacity}
                  </div>
                  {full ? (
                    <Html html={pill("受付ブロック", C.red, "#FDEBEB")} />
                  ) : (
                    <button onClick={() => openEdit(t)} style={sx(btn(C.soft, C.deep) + "padding:7px 12px;font-size:12px")}>
                      編集
                    </button>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* REGISTRATION / ADMIN INFO */}
      <section style={sx(card + "padding:18px 20px")}>
        <div className="r-head" style={sx("display:flex;align-items:center;justify-content:space-between")}>
          <div>
            <div style={sx(h2)}>ツアー枠・管理者情報の登録</div>
            <div style={sx(label + "margin-top:3px")}>
              上限枠と担当管理者を登録。Supabaseに保存され、参加者名簿から相互参照されます（将来はOTAから自動取込）
            </div>
          </div>
          <button
            onClick={() => (adding ? (setAdding(false), setEditId(null)) : openAdd())}
            style={sx(btn(adding ? C.soft : C.blue, adding ? C.sub : "#fff") + "display:flex;align-items:center;gap:7px")}
          >
            {adding ? (
              "閉じる"
            ) : (
              <>
                <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
                ツアー枠を登録
              </>
            )}
          </button>
        </div>

        {adding ? (
          <div
            className="r-form"
            style={sx(
              "background:#F2FAFE;border:1.5px solid #CFE7F4;border-radius:14px;padding:16px;margin-top:14px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px"
            )}
          >
            <div>
              <div style={sx(label + "margin-bottom:5px")}>運行日</div>
              <input style={inputStyle} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>ツアー名 *</div>
              <input
                style={inputStyle}
                list="tour-presets"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例: モーニング・スノーケル"
              />
              <datalist id="tour-presets">
                {TOUR_PRESETS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>開始時刻</div>
              <input style={inputStyle} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>上限枠（定員）</div>
              <input style={inputStyle} type="number" min={0} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>予約数（現在）</div>
              <input style={inputStyle} type="number" min={0} value={form.booked} onChange={(e) => setForm({ ...form, booked: e.target.value })} />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>担当管理者</div>
              <input style={inputStyle} value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="例: K. Lee" />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>連絡先</div>
              <input style={inputStyle} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="例: +61 4xx xxx xxx" />
            </div>
            <div>
              <div style={sx(label + "margin-bottom:5px")}>集合場所</div>
              <input style={inputStyle} value={form.meet} onChange={(e) => setForm({ ...form, meet: e.target.value })} placeholder="例: Cavill Ave 桟橋" />
            </div>
            <div style={sx("grid-column:1 / 4")}>
              <div style={sx(label + "margin-bottom:5px")}>メモ</div>
              <input style={inputStyle} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="備考・注意事項など" />
            </div>
            <div style={sx("display:flex;align-items:flex-end")}>
              <button
                onClick={save}
                disabled={saving}
                style={sx(btn(C.green, "#fff") + "width:100%" + (saving ? ";opacity:.6;cursor:wait" : ""))}
              >
                {saving ? "保存中…" : editId ? "更新する" : "登録する"}
              </button>
            </div>
          </div>
        ) : null}

        {err ? (
          <div
            style={sx(
              "margin-top:12px;background:#FDEBEB;border:1px solid #F3D2D2;border-radius:10px;padding:10px 13px;font-size:12px;color:" +
                C.red
            )}
          >
            {err}（Supabase の tours テーブル / ログイン状態をご確認ください）
          </div>
        ) : null}

        {tours.length ? (
          <div className="r-scroll" style={sx("margin-top:16px")}>
            <div className="r-twwrap">
            <div
              style={sx(
                "display:grid;grid-template-columns:1fr .8fr 1.6fr 1.3fr 1.1fr 1fr 64px;gap:10px;padding:0 12px 9px;font-size:11px;font-weight:700;color:" +
                  C.sub
              )}
            >
              <div>運行日</div>
              <div>時刻</div>
              <div>ツアー名</div>
              <div>担当管理者</div>
              <div>集合場所</div>
              <div style={sx("text-align:center")}>予約 / 上限</div>
              <div />
            </div>
            {tours.map((t) => {
              const full = t.capacity > 0 && t.booked >= t.capacity;
              return (
                <div
                  key={t.id}
                  style={sx(
                    "display:grid;grid-template-columns:1fr .8fr 1.6fr 1.3fr 1.1fr 1fr 64px;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid #F0F5F8;cursor:pointer;background:" +
                      (t.date === selDate ? "#F7FBFE" : "#fff")
                  )}
                  onClick={() => setSelDate(t.date)}
                >
                  <div style={sx("font-size:12px;color:" + C.sub)}>{t.date.slice(5).replace("-", "/")}</div>
                  <div className="font-outfit" style={sx("font-weight:700;font-size:13px")}>{t.time}</div>
                  <div style={sx("font-size:13px;font-weight:700")}>
                    {t.name}
                    {t.source === "ota" ? (
                      <span style={sx("margin-left:6px")}>
                        <Html html={pill("OTA", C.deep, "#E3F2FB")} />
                      </span>
                    ) : null}
                  </div>
                  <div style={sx("font-size:12px")}>
                    {t.manager || <span style={sx("color:#B7C7D3")}>未設定</span>}
                    {t.contact ? <div style={sx("font-size:11px;color:" + C.sub)}>{t.contact}</div> : null}
                  </div>
                  <div style={sx("font-size:12px;color:" + C.sub)}>{t.meet || "—"}</div>
                  <div className="font-outfit" style={sx("text-align:center;font-weight:800;font-size:14px;color:" + (full ? C.red : C.green))}>
                    {t.booked}/{t.capacity}
                  </div>
                  <div style={sx("display:flex;gap:8px;justify-content:flex-end")}>
                    <div onClick={(ev) => (ev.stopPropagation(), openEdit(t))} title="編集" style={sx("cursor:pointer")}>
                      <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 19h14M7 15l9-9 3 3-9 9H7v-3Z" stroke="#6E8BA0" stroke-width="2" stroke-linejoin="round"/></svg>' />
                    </div>
                    <div onClick={(ev) => (ev.stopPropagation(), remove(t.id))} title="削除" style={sx("cursor:pointer")}>
                      <Html html='<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V5h6v2M7 7l1 13h8l1-13" stroke="#9DB4C4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                    </div>
                  </div>
                </div>
              );
            })}
            <div
              style={sx(
                "display:flex;justify-content:flex-end;align-items:center;gap:14px;margin-top:8px;padding:11px 14px;background:#F2FAFE;border-radius:12px"
              )}
            >
              <span style={sx("font-size:13px;font-weight:700;color:" + C.deep)}>登録枠 合計（{tours.length}枠）</span>
              <span className="font-outfit" style={sx("font-weight:800;font-size:18px;color:" + C.ink)}>
                予約 {totalBooked} / 上限 {totalCap}名
              </span>
            </div>
            </div>
          </div>
        ) : !adding ? (
          <div
            style={sx(
              "margin-top:14px;border:1.5px dashed #C9DCE8;border-radius:12px;padding:18px;text-align:center;font-size:12px;color:#9DB4C4"
            )}
          >
            {loading
              ? "Supabase からツアー枠を読み込み中…"
              : "まだツアー枠は登録されていません。「ツアー枠を登録」から上限枠・担当管理者を設定してください。"}
          </div>
        ) : null}
      </section>
    </div>
  );
}
