"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { sx } from "@/lib/sx";
import { Html } from "./Html";
import { createClient } from "@/lib/supabase/client";
import { Member, fetchMyProfile, fetchMembers, JOB_LABELS } from "@/lib/members";
import { fetchTours } from "@/lib/tours";
import {
  ChatThread,
  ChatMessage,
  fetchThreads,
  ensureTourThread,
  ensureBroadcastThread,
  fetchMyThreadMembers,
  startDm,
  fetchMessages,
  sendMessage,
  subscribeMessages,
  subscribeAllMessages,
  markRead,
  fetchUnreadCounts,
} from "@/lib/chat";

export function FloatingChat({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [me, setMe] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [dmOther, setDmOther] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const totalUnread = useMemo(
    () => Object.values(unread).reduce((a, b) => a + b, 0),
    [unread]
  );

  async function refreshUnread() {
    try {
      setUnread(await fetchUnreadCounts());
    } catch {
      /* 未ログイン等は無視 */
    }
  }

  // 未読の初期取得＋全メッセージ購読（開閉に関係なくボタンのバッジを更新）
  useEffect(() => {
    refreshUnread();
    const unsub = subscribeAllMessages(() => refreshUnread());
    return unsub;
  }, []);

  // 表示中スレッドを既読化（開いている間・新着ごと）
  useEffect(() => {
    if (!open || !activeId) return;
    markRead(activeId).then(refreshUnread).catch(() => {});
  }, [open, activeId, messages.length]);

  const names = useMemo(
    () => Object.fromEntries(members.map((m) => [m.userId, m.displayName || "メンバー"])),
    [members]
  );
  const meId = me?.userId ?? null;
  const isHQ = me?.role === "owner" || me?.job === "ops";
  const canPostBroadcast = me?.role === "owner";

  // DM候補: 本部⇄スタッフのみ。本部は全員、スタッフは本部のみ。
  const dmCandidates = useMemo(() => {
    if (!me) return [];
    return members.filter((m) => {
      if (!m.active || m.userId === me.userId) return false;
      const otherHQ = m.role === "owner" || m.job === "ops";
      return isHQ ? true : otherHQ;
    });
  }, [members, me, isHQ]);

  // 開いたときに プロフィール / メンバー / 便グループ・アナウンス を用意
  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const [profile, list] = await Promise.all([
          fetchMyProfile().catch(() => null),
          fetchMembers().catch(() => [] as Member[]),
        ]);
        if (active) {
          setMe(profile);
          setMembers(list);
        }

        await ensureBroadcastThread().catch(() => {});
        const tours = await fetchTours().catch(() => []);
        for (const t of tours.slice(-30)) {
          await ensureTourThread(
            t.id,
            `${t.date.slice(5).replace("-", "/")} ${t.time} ${t.name}`
          ).catch(() => {});
        }

        const [ths, tm] = await Promise.all([fetchThreads(), fetchMyThreadMembers().catch(() => [])]);
        if (!active) return;
        setThreads(ths);
        const myId = profile?.userId;
        const map: Record<string, string> = {};
        for (const row of tm) {
          if (myId && row.userId !== myId) map[row.threadId] = row.userId;
        }
        setDmOther(map);
        setActiveId((cur) => cur ?? ths[ths.length - 1]?.id ?? null);
      } catch (e: any) {
        if (active) setErr(e?.message ?? "チャットの読み込みに失敗しました");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open]);

  // 選択スレッドのメッセージ取得＋リアルタイム購読
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let active = true;
    fetchMessages(activeId)
      .then((ms) => {
        if (active) setMessages(ms);
      })
      .catch(() => {});
    const unsub = subscribeMessages(activeId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });
    return () => {
      active = false;
      unsub();
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeId]);

  async function send() {
    const body = input.trim();
    if (!body || !activeId || sending) return;
    setSending(true);
    setErr(null);
    try {
      const m = await sendMessage(activeId, body);
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      setInput("");
    } catch (e: any) {
      setErr(e?.message ?? "送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  async function openDm(target: Member) {
    setShowNew(false);
    try {
      const th = await startDm(target.userId, target.displayName || "メンバー");
      setThreads((prev) => (prev.some((t) => t.id === th.id) ? prev : [...prev, th]));
      setDmOther((prev) => ({ ...prev, [th.id]: target.userId }));
      setActiveId(th.id);
    } catch (e: any) {
      setErr(e?.message ?? "DMの作成に失敗しました");
    }
  }

  function threadLabel(th: ChatThread): string {
    if (th.type === "broadcast") return "📢 全体アナウンス";
    if (th.type === "dm") return names[dmOther[th.id]] || "DM";
    return th.title || "便グループ";
  }

  function fmtTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  if (!open) {
    return (
      <div
        onClick={onToggle}
        style={{
          ...sx(
            "position:absolute;right:24px;bottom:24px;width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg,#0E8FC9,#0A5688);box-shadow:0 12px 28px rgba(10,86,136,.42);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:50"
          ),
          animation: "sos 2.4s ease infinite",
        }}
      >
        <Html html='<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' />
        {totalUnread > 0 ? (
          <span
            className="font-outfit"
            style={sx(
              "position:absolute;top:-4px;right:-4px;background:#E5484D;color:#fff;font-weight:800;font-size:11px;min-width:22px;height:22px;padding:0 5px;box-sizing:border-box;border-radius:11px;display:flex;align-items:center;justify-content:center;border:2px solid #fff"
            )}
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        ) : null}
      </div>
    );
  }

  const left = "align-self:flex-start;max-width:82%";
  const right = "align-self:flex-end;max-width:82%;text-align:right";
  const bubbleL =
    "background:#fff;border:1px solid #E6EEF4;border-radius:14px 14px 14px 4px;padding:9px 12px;font-size:12.5px;line-height:1.45;display:inline-block;text-align:left;white-space:pre-wrap;word-break:break-word";
  const bubbleR =
    "background:linear-gradient(120deg,#0E8FC9,#0A6FB0);color:#fff;border-radius:14px 14px 4px 14px;padding:9px 12px;font-size:12.5px;line-height:1.45;display:inline-block;text-align:left;white-space:pre-wrap;word-break:break-word";

  const active = threads.find((t) => t.id === activeId) || null;
  const broadcastLocked = active?.type === "broadcast" && !canPostBroadcast;
  const inputDisabled = !activeId || broadcastLocked;

  return (
    <div
      className="chat-panel"
      style={{
        ...sx(
          "position:absolute;right:24px;bottom:24px;width:360px;height:520px;background:#fff;border-radius:18px;box-shadow:0 22px 60px rgba(8,60,100,.32);display:flex;flex-direction:column;overflow:hidden;z-index:50;border:1px solid #E0EBF2"
        ),
        animation: "floatin .25s ease",
      }}
    >
      <div
        style={sx(
          "background:linear-gradient(120deg,#0A5688,#0E8FC9);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px"
        )}
      >
        <div
          style={sx(
            "width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center"
          )}
        >
          <Html html='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.8A8 8 0 1 1 21 12Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' />
        </div>
        <div style={sx("flex:1;min-width:0")}>
          <div style={sx("font-weight:800;font-size:14px")}>オペレーションチャット</div>
          <div style={sx("font-size:11px;color:#BDE5F5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
            {active ? threadLabel(active) : "便グループ・DM・アナウンス"}
          </div>
        </div>
        <div
          onClick={onToggle}
          style={sx(
            "cursor:pointer;width:28px;height:28px;border-radius:8px;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center"
          )}
        >
          <Html html='<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>' />
        </div>
      </div>

      {/* スレッドタブ + 新規DM */}
      {threads.length > 0 || dmCandidates.length > 0 ? (
        <div style={sx("display:flex;gap:7px;padding:10px 12px;border-bottom:1px solid #EEF3F7;overflow-x:auto;align-items:center")}>
          {dmCandidates.length > 0 ? (
            <div
              onClick={() => setShowNew((v) => !v)}
              title="DMを開始"
              style={sx(
                "flex-shrink:0;width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:" +
                  (showNew ? "#0E8FC9" : "#F0F6FA")
              )}
            >
              <Html
                html={
                  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="' +
                  (showNew ? "#fff" : "#5A7488") +
                  '" stroke-width="2" stroke-linecap="round"/></svg>'
                }
              />
            </div>
          ) : null}
          {threads.map((th) => {
            const on = th.id === activeId;
            const n = unread[th.id] || 0;
            return (
              <div
                key={th.id}
                onClick={() => setActiveId(th.id)}
                style={sx(
                  "flex-shrink:0;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;padding:7px 11px;border-radius:10px;cursor:pointer;white-space:nowrap;max-width:180px;" +
                    (on ? "background:#0E8FC9;color:#fff" : "background:#F0F6FA;color:#5A7488")
                )}
                title={threadLabel(th)}
              >
                <span style={sx("overflow:hidden;text-overflow:ellipsis")}>{threadLabel(th)}</span>
                {n > 0 && !on ? (
                  <span
                    className="font-outfit"
                    style={sx(
                      "flex-shrink:0;background:#E5484D;color:#fff;font-size:9px;font-weight:800;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;display:flex;align-items:center;justify-content:center"
                    )}
                  >
                    {n > 99 ? "99+" : n}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={sx("flex:1;position:relative;display:flex;flex-direction:column;min-height:0")}>
        {/* 新規DMポップオーバー */}
        {showNew ? (
          <div
            style={sx(
              "position:absolute;left:12px;right:12px;top:8px;z-index:5;background:#fff;border:1px solid #E0EBF2;border-radius:12px;box-shadow:0 12px 30px rgba(8,60,100,.2);max-height:70%;overflow-y:auto"
            )}
          >
            <div style={sx("padding:10px 13px;font-size:11px;font-weight:800;color:#5A7488;border-bottom:1px solid #EEF3F7")}>
              DMを開始（{isHQ ? "スタッフを選択" : "本部を選択"}）
            </div>
            {dmCandidates.map((m) => (
              <div
                key={m.userId}
                onClick={() => openDm(m)}
                style={sx("display:flex;align-items:center;gap:9px;padding:10px 13px;cursor:pointer;border-bottom:1px solid #F4F8FB")}
              >
                <div style={sx("width:28px;height:28px;border-radius:50%;background:#0A5688;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0")}>
                  {(m.displayName || "?").charAt(0).toUpperCase()}
                </div>
                <div style={sx("flex:1;min-width:0")}>
                  <div style={sx("font-size:13px;font-weight:700;color:#0E2A3D")}>{m.displayName || "（無名）"}</div>
                  <div style={sx("font-size:10px;color:#9DB4C4")}>{JOB_LABELS[m.job]}{m.role === "owner" ? " ・ オーナー" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* メッセージ */}
        <div
          style={sx(
            "flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#F6FAFC"
          )}
        >
          {loading ? (
            <div style={sx("margin:auto;font-size:12px;color:#9DB4C4")}>読み込み中…</div>
          ) : threads.length === 0 ? (
            <div style={sx("margin:auto;text-align:center;font-size:12px;color:#9DB4C4;line-height:1.7;padding:0 10px")}>
              スレッドがまだありません。<br />
              予約・カレンダーでツアー枠を登録すると便グループが作成されます。
            </div>
          ) : messages.length === 0 ? (
            <div style={sx("margin:auto;font-size:12px;color:#9DB4C4")}>まだメッセージはありません</div>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === meId;
              return (
                <div key={m.id} style={sx(mine ? right : left)}>
                  {!mine ? (
                    <div style={sx("font-size:10px;color:#9DB4C4;margin:0 0 3px 4px;font-weight:600")}>
                      {names[m.senderId] || "メンバー"}
                    </div>
                  ) : null}
                  <div style={sx(mine ? bubbleR : bubbleL)}>{m.body}</div>
                  <div style={sx("font-size:9px;color:#B3C4D0;margin:3px 4px 0")}>{fmtTime(m.createdAt)}</div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {err ? (
        <div style={sx("padding:6px 12px;font-size:11px;color:#B91C1C;background:#FEF2F2;border-top:1px solid #F5D9D9")}>
          {err}
        </div>
      ) : null}

      {/* 入力 */}
      <div style={sx("padding:11px 12px;border-top:1px solid #EEF3F7;display:flex;align-items:center;gap:9px")}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={inputDisabled}
          placeholder={
            broadcastLocked
              ? "アナウンスは本部のみ送信できます"
              : activeId
              ? "メッセージを入力…"
              : "スレッドを選択してください"
          }
          style={sx(
            "flex:1;box-sizing:border-box;background:#F0F6FA;border:1px solid #E6EEF4;border-radius:12px;padding:10px 13px;font-family:inherit;font-size:12.5px;color:#0E2A3D;outline:none" +
              (inputDisabled ? ";opacity:.6" : "")
          )}
        />
        <div
          onClick={send}
          style={sx(
            "width:38px;height:38px;flex-shrink:0;border-radius:11px;background:" +
              (input.trim() && !inputDisabled && !sending ? "#0E8FC9" : "#B7CEDD") +
              ";display:flex;align-items:center;justify-content:center;cursor:pointer"
          )}
        >
          <Html html='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' />
        </div>
      </div>
    </div>
  );
}
