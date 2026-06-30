"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/auth/actions";
import { sx } from "@/lib/sx";
import { Html } from "./Html";

// Topbar に表示するユーザー情報＋ログアウト
export function UserMenu() {
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const display =
        (u.user_metadata?.display_name as string | undefined) ?? u.email ?? "";
      setName(display);
    });
  }, []);

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div style={sx("display:flex;align-items:center;flex-shrink:0")}>
      {/* デスクトップ: アバター＋氏名＋ログアウト文言 */}
      <div className="user-full" style={sx("display:flex;align-items:center;gap:10px")}>
        <div
          style={sx(
            "width:34px;height:34px;border-radius:50%;background:#0A5688;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0"
          )}
        >
          {initial}
        </div>
        <div style={sx("line-height:1.2;white-space:nowrap")}>
          <div style={sx("font-size:13px;font-weight:700")}>{name || "—"}</div>
          <form action={signout}>
            <button
              type="submit"
              style={sx(
                "background:none;border:none;padding:0;margin-top:1px;color:#6E8BA0;font-size:11px;cursor:pointer;text-align:left"
              )}
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>

      {/* スマホ: ログアウトアイコンのみ */}
      <form action={signout} className="user-logout-icon">
        <button
          type="submit"
          title="ログアウト"
          style={sx(
            "width:40px;height:40px;border-radius:11px;background:#F0F6FA;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0"
          )}
        >
          <Html html='<svg width="19" height="19" viewBox="0 0 24 24" fill="none"><path d="M14 4h5v16h-5M14 12H4M4 12l4-4M4 12l4 4" stroke="#0A5688" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
        </button>
      </form>
    </div>
  );
}
