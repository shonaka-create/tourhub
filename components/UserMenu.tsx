"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signout } from "@/app/auth/actions";
import { sx } from "@/lib/sx";

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
    <div style={sx("display:flex;align-items:center;gap:10px")}>
      <div
        style={sx(
          "width:34px;height:34px;border-radius:50%;background:#0A5688;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px"
        )}
      >
        {initial}
      </div>
      <div style={sx("line-height:1.2")}>
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
  );
}
