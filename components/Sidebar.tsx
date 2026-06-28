import { sx } from "@/lib/sx";
import { navItems, NavId } from "@/lib/data";
import { Html } from "./Html";

export function Sidebar({
  active,
  onSelect,
}: {
  active: NavId;
  onSelect: (id: NavId) => void;
}) {
  return (
    <aside
      style={sx(
        "width:248px;flex-shrink:0;background:linear-gradient(180deg,#063A5E 0%,#0A5688 100%);color:#fff;display:flex;flex-direction:column;position:relative;overflow:hidden"
      )}
    >
      <div
        style={sx(
          "position:absolute;bottom:-40px;left:-30px;right:-30px;height:120px;opacity:.18;background:radial-gradient(120px 60px at 30% 40%,#7FE3E0,transparent),radial-gradient(140px 70px at 70% 60%,#39B8E8,transparent)"
        )}
      />
      <div style={sx("padding:22px 22px 18px;display:flex;align-items:center;gap:11px")}>
        <div
          style={sx(
            "width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#39D2C0,#1E8FD6);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(30,143,214,.45)"
          )}
        >
          <Html
            html='<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 16c2 0 2.5-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2.5 2 4.5 2" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M3 11c2 0 2.5-2 4.5-2s2.5 2 4.5 2 2.5-2 4.5-2 2.5 2 4.5 2" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".55"/><circle cx="12" cy="5" r="1.6" fill="#FFD45E"/></svg>'
            style={{ display: "flex" }}
          />
        </div>
        <div>
          <div
            className="font-outfit"
            style={sx("font-weight:800;font-size:18px;letter-spacing:.4px;line-height:1")}
          >
            Tourhub
          </div>
          <div
            style={sx(
              "font-size:10px;letter-spacing:1.5px;color:#9FD6EF;font-weight:500;margin-top:3px"
            )}
          >
            GOLD COAST OPS
          </div>
        </div>
      </div>

      <div
        style={sx(
          "padding:4px 14px;font-size:10px;letter-spacing:1.5px;color:#7FB8D8;font-weight:700;margin-top:6px"
        )}
      >
        メニュー
      </div>
      <nav
        style={sx(
          "flex:1;overflow-y:auto;padding:4px 12px;display:flex;flex-direction:column;gap:2px"
        )}
      >
        {navItems.map((item) => {
          const on = active === item.id;
          const cur = on ? "#063A5E" : "#CFE7F4";
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={sx(
                "display:flex;align-items:center;gap:11px;padding:10px 13px;border-radius:11px;cursor:pointer;font-size:13px;font-weight:" +
                  (on ? "700" : "500") +
                  ";transition:.15s;" +
                  (on
                    ? "background:#fff;color:#063A5E;box-shadow:0 6px 16px rgba(0,0,0,.18)"
                    : "color:#CFE7F4;background:transparent")
              )}
            >
              <Html
                style={sx("width:20px;display:flex;justify-content:center")}
                html={
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none">' +
                  item.iconPath.replace(/CUR/g, cur) +
                  "</svg>"
                }
              />
              <span style={sx("flex:1")}>{item.label}</span>
              {item.badge ? (
                <span
                  className="font-outfit"
                  style={sx(
                    "font-weight:800;font-size:10px;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;background:" +
                      (item.badgeColor || "#E5484D")
                  )}
                >
                  {item.badge}
                </span>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div
        style={sx(
          "padding:14px;border-top:1px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:10px"
        )}
      >
        <div
          style={sx(
            "width:36px;height:36px;border-radius:10px;background:#0E486E;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#A9E5F0"
          )}
        >
          YT
        </div>
        <div style={sx("flex:1;line-height:1.3")}>
          <div style={sx("font-size:13px;font-weight:700")}>山田 太郎</div>
          <div style={sx("font-size:11px;color:#9FD6EF")}>オペレーション本部</div>
        </div>
        <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#9FD6EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
      </div>
    </aside>
  );
}
