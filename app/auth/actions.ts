"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteURL } from "@/lib/site";

export type AuthState = { error?: string } | undefined;

// Supabase の英語エラーを日本語に変換する
function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "メールアドレスまたはパスワードが正しくありません。";
  if (m.includes("email not confirmed"))
    return "メール認証が完了していません。確認メール内のリンクを開いてください。";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "このメールアドレスは既に登録されています。";
  if (m.includes("password should be at least"))
    return "パスワードは 6 文字以上で入力してください。";
  if (m.includes("unable to validate email") || m.includes("invalid format"))
    return "メールアドレスの形式が正しくありません。";
  if (m.includes("rate limit") || m.includes("too many"))
    return "試行回数が多すぎます。しばらく待ってから再度お試しください。";
  return `エラーが発生しました：${message}`;
}

// ── サインアップ（メアド・パスワード・表示名）──
export async function signup(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!email || !password || !displayName)
    return { error: "すべての項目を入力してください。" };
  if (password.length < 6)
    return { error: "パスワードは 6 文字以上で入力してください。" };

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // user_metadata.display_name に表示名を保存
      data: { display_name: displayName },
      // メール認証リンクのリダイレクト先（確認用ルート）
      emailRedirectTo: `${getSiteURL()}auth/confirm`,
    },
  });

  if (error) return { error: translate(error.message) };

  // 確認メール送信完了ページへ
  redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
}

// ── ログイン ──
export async function login(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "メールアドレスとパスワードを入力してください。" };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: translate(error.message) };

  revalidatePath("/", "layout");
  redirect("/");
}

// ── ログアウト ──
export async function signout(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
