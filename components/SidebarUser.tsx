"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sx } from "@/lib/sx";
import { Html } from "./Html";

// サイドバー下部に表示するログインユーザー情報
export function SidebarUser() {
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      const display =
        (u.user_metadata?.display_name as string | undefined) ?? u.email ?? "";
      setName(display);
      setRole((u.user_metadata?.role as string | undefined) ?? "オペレーション本部");
    });
  }, []);

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
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
        {initial}
      </div>
      <div style={sx("flex:1;line-height:1.3;min-width:0")}>
        <div
          style={sx(
            "font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          )}
        >
          {name || "—"}
        </div>
        <div style={sx("font-size:11px;color:#9FD6EF")}>{role}</div>
      </div>
      <Html html='<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#9FD6EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
    </div>
  );
}
