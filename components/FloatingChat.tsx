import { sx } from "@/lib/sx";
import { threadDefs, msgSets } from "@/lib/data";
import { Html } from "./Html";

export function FloatingChat({
  open,
  onToggle,
  thread,
  onThread,
}: {
  open: boolean;
  onToggle: () => void;
  thread: string;
  onThread: (id: string) => void;
}) {
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
        <span
          className="font-outfit"
          style={sx(
            "position:absolute;top:-4px;right:-4px;background:#E5484D;color:#fff;font-weight:800;font-size:11px;min-width:22px;height:22px;border-radius:11px;display:flex;align-items:center;justify-content:center;border:2px solid #fff"
          )}
        >
          3
        </span>
      </div>
    );
  }

  const messages = msgSets[thread] || msgSets.snorkel;
  const left = "align-self:flex-start;max-width:80%";
  const right = "align-self:flex-end;max-width:80%;text-align:right";
  const bubbleL =
    "background:#fff;border:1px solid #E6EEF4;border-radius:14px 14px 14px 4px;padding:9px 12px;font-size:12.5px;line-height:1.45;display:inline-block;text-align:left";
  const bubbleR =
    "background:linear-gradient(120deg,#0E8FC9,#0A6FB0);color:#fff;border-radius:14px 14px 4px 14px;padding:9px 12px;font-size:12.5px;line-height:1.45;display:inline-block;text-align:left";

  return (
    <div
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
        <div style={sx("flex:1")}>
          <div style={sx("font-weight:800;font-size:14px")}>オペレーションチャット</div>
          <div style={sx("font-size:11px;color:#BDE5F5")}>現場 ⇄ 本部 · 5名オンライン</div>
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

      <div
        style={sx(
          "display:flex;gap:7px;padding:10px 12px;border-bottom:1px solid #EEF3F7;overflow-x:auto"
        )}
      >
        {threadDefs.map((th) => {
          const on = thread === th.id;
          return (
            <div
              key={th.id}
              onClick={() => onThread(th.id)}
              style={sx(
                "flex-shrink:0;font-size:11px;font-weight:700;padding:7px 11px;border-radius:10px;cursor:pointer;white-space:nowrap;" +
                  (on ? "background:#0E8FC9;color:#fff" : "background:#F0F6FA;color:#5A7488")
              )}
            >
              {th.label}
              {th.unread ? (
                <span
                  style={sx(
                    "margin-left:5px;background:#E5484D;color:#fff;font-size:9px;font-weight:800;padding:1px 5px;border-radius:8px"
                  )}
                >
                  {th.unread}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div
        style={sx(
          "flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:#F6FAFC"
        )}
      >
        {messages.map((m, i) => (
          <div key={i} style={sx(m.side === "left" ? left : right)}>
            {m.showName ? (
              <div
                style={sx(
                  "font-size:10px;color:#9DB4C4;margin:0 0 3px 4px;font-weight:600"
                )}
              >
                {m.name}
              </div>
            ) : null}
            <div style={sx(m.side === "left" ? bubbleL : bubbleR)}>{m.text}</div>
            {m.photo ? (
              <div
                style={sx(
                  "margin-top:6px;width:150px;height:96px;border-radius:12px;background:linear-gradient(135deg,#9EC9DE,#6FA8C4);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;border:1px solid rgba(0,0,0,.05)"
                )}
              >
                📷 現場写真.jpg
              </div>
            ) : null}
            <div style={sx("font-size:9px;color:#B3C4D0;margin:3px 4px 0")}>{m.time}</div>
          </div>
        ))}
      </div>

      <div
        style={sx(
          "padding:11px 12px;border-top:1px solid #EEF3F7;display:flex;align-items:center;gap:9px"
        )}
      >
        <div
          style={sx(
            "width:34px;height:34px;border-radius:10px;background:#F0F6FA;display:flex;align-items:center;justify-content:center;cursor:pointer"
          )}
        >
          <Html html='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="3" stroke="#6E8BA0" stroke-width="2"/><circle cx="9" cy="11" r="2" stroke="#6E8BA0" stroke-width="2"/><path d="M4 18l5-4 4 3 3-2 4 3" stroke="#6E8BA0" stroke-width="2" stroke-linejoin="round"/></svg>' />
        </div>
        <div
          style={sx(
            "flex:1;background:#F0F6FA;border-radius:12px;padding:10px 13px;font-size:12px;color:#9DB4C4"
          )}
        >
          メッセージを入力…
        </div>
        <div
          style={sx(
            "width:38px;height:38px;border-radius:11px;background:#0E8FC9;display:flex;align-items:center;justify-content:center;cursor:pointer"
          )}
        >
          <Html html='<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>' />
        </div>
      </div>
    </div>
  );
}
