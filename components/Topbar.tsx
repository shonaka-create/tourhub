import { sx } from "@/lib/sx";
import { Html } from "./Html";
import { UserMenu } from "./UserMenu";

export function Topbar({
  title,
  sub,
  clock,
  onMenu,
}: {
  title: string;
  sub: string;
  clock: string;
  onMenu?: () => void;
}) {
  return (
    <header
      className="app-topbar"
      style={sx(
        "height:64px;flex-shrink:0;background:#fff;border-bottom:1px solid #E0EBF2;display:flex;align-items:center;padding:0 26px;gap:18px"
      )}
    >
      <div
        className="nav-toggle"
        onClick={onMenu}
        style={sx(
          "width:40px;height:40px;border-radius:11px;background:#F0F6FA;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0"
        )}
      >
        <Html html='<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="#0A5688" stroke-width="2" stroke-linecap="round"/></svg>' />
      </div>
      <div style={sx("min-width:0")}>
        <div style={sx("font-size:18px;font-weight:900;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{title}</div>
        <div style={sx("font-size:11px;color:#6E8BA0;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{sub}</div>
      </div>
      <div style={sx("flex:1")} />
      <div
        className="topbar-search"
        style={sx(
          "display:flex;align-items:center;gap:9px;background:#F0F6FA;border:1px solid #E0EBF2;border-radius:10px;padding:8px 13px;width:280px"
        )}
      >
        <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#9DB4C4" stroke-width="2"/><path d="M20 20l-3-3" stroke="#9DB4C4" stroke-width="2" stroke-linecap="round"/></svg>' />
        <span style={sx("color:#9DB4C4;font-size:13px")}>
          予約番号・お客様名で検索…
        </span>
      </div>
      <div className="topbar-date" style={sx("text-align:right;line-height:1.3")}>
        <div style={sx("font-size:13px;font-weight:700")}>2026年6月28日 (日)</div>
        <div style={sx("font-size:11px;color:#6E8BA0")}>{clock} AEST</div>
      </div>
      <div
        style={sx(
          "position:relative;width:40px;height:40px;border-radius:11px;background:#F0F6FA;display:flex;align-items:center;justify-content:center;cursor:pointer"
        )}
      >
        <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 0-6 6c0 4-2 5-2 7h16c0-2-2-3-2-7a6 6 0 0 0-6-6Z" stroke="#0A5688" stroke-width="2" stroke-linejoin="round"/><path d="M10 20a2 2 0 0 0 4 0" stroke="#0A5688" stroke-width="2"/></svg>' />
        <span
          style={sx(
            "position:absolute;top:7px;right:8px;width:8px;height:8px;border-radius:50%;background:#E5484D;border:2px solid #fff"
          )}
        />
      </div>
      <UserMenu />
    </header>
  );
}
