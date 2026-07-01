"use client";

import { useEffect, useRef, useState } from "react";
import { sx } from "@/lib/sx";
import { Html } from "./Html";
import { createClient } from "@/lib/supabase/client";
import { fetchMembers } from "@/lib/members";
import { fetchTours } from "@/lib/tours";
import {
  ChatThread,
  ChatMessage,
  fetchThreads,
  ensureTourThread,
  fetchMessages,
  sendMessage,
  subscribeMessages,
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
  const [names, setNames] = useState<Record<string, string>>({});
  const [meId, setMeId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 開いたときに 自分ID / メンバー名 / 便グループ を用意
  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const supabase = createClient();
        const { data: auth } = await supabase.auth.getUser();
        if (active) setMeId(auth.user?.id ?? null);

        const members = await fetchMembers().catch(() => []);
        if (active) {
          setNames(Object.fromEntries(members.map((m) => [m.userId, m.displayName || "メンバー"])));
        }

        // 登録済みツアーから便グループを自動用意（1ツアー=1スレッド・冪等）
        const tours = await fetchTours().catch(() => []);
        for (const t of tours.slice(-30)) {
          await ensureTourThread(
            t.id,
            `${t.date.slice(5).replace("-", "/")} ${t.time} ${t.name}`
          ).catch(() => {});
        }

        const list = await fetchThreads();
        if (!active) return;
        setThreads(list);
        setActiveId((cur) => cur ?? list[list.length - 1]?.id ?? null);
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

  // 新着で最下部へスクロール
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
            {active ? active.title || "便グループ" : "現場 ⇄ 本部"}
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

      {/* スレッドタブ（便グループ） */}
      {threads.length > 0 ? (
        <div style={sx("display:flex;gap:7px;padding:10px 12px;border-bottom:1px solid #EEF3F7;overflow-x:auto")}>
          {threads.map((th) => {
            const on = th.id === activeId;
            return (
              <div
                key={th.id}
                onClick={() => setActiveId(th.id)}
                style={sx(
                  "flex-shrink:0;font-size:11px;font-weight:700;padding:7px 11px;border-radius:10px;cursor:pointer;white-space:nowrap;max-width:180px;overflow:hidden;text-overflow:ellipsis;" +
                    (on ? "background:#0E8FC9;color:#fff" : "background:#F0F6FA;color:#5A7488")
                )}
                title={th.title}
              >
                {th.title || "便グループ"}
              </div>
            );
          })}
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
            便グループはまだありません。<br />
            予約・カレンダーでツアー枠を登録すると、
            そのツアーの便グループが自動で作成されます。
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
          disabled={!activeId}
          placeholder={activeId ? "メッセージを入力…" : "便グループを選択してください"}
          style={sx(
            "flex:1;box-sizing:border-box;background:#F0F6FA;border:1px solid #E6EEF4;border-radius:12px;padding:10px 13px;font-family:inherit;font-size:12.5px;color:#0E2A3D;outline:none" +
              (!activeId ? ";opacity:.6" : "")
          )}
        />
        <div
          onClick={send}
          style={sx(
            "width:38px;height:38px;flex-shrink:0;border-radius:11px;background:" +
              (input.trim() && activeId && !sending ? "#0E8FC9" : "#B7CEDD") +
              ";display:flex;align-items:center;justify-content:center;cursor:pointer"
          )}
        >
          <Html html='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' />
        </div>
      </div>
    </div>
  );
}
