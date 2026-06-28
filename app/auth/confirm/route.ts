import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// メール認証リンク（確認 URL）の着地点。
// Supabase のメールテンプレートに応じて 2 種類のパラメータに対応する：
//   - token_hash + type … 推奨（カスタムテンプレート）→ verifyOtp
//   - code            … 既定テンプレート（PKCE）       → exchangeCodeForSession
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // ロードバランサ越し（Vercel）でも正しいホストへ戻すための補正
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const redirectBase = isLocal
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  const supabase = createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(`${redirectBase}${next}`);
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${redirectBase}${next}`);
  }

  // 検証失敗 → エラーページへ
  return NextResponse.redirect(`${redirectBase}/auth/auth-code-error`);
}
