"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signup } from "@/app/auth/actions";
import {
  AuthShell,
  fieldStyle,
  labelStyle,
  buttonStyle,
  errorStyle,
} from "@/components/auth/AuthShell";
import { sx } from "@/lib/sx";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} style={buttonStyle}>
      {pending ? "登録中…" : "登録して確認メールを送る"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, undefined);

  return (
    <AuthShell
      title="新規登録"
      subtitle="登録後、確認メールのリンクを開くとログインできます"
      footer={
        <>
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" style={sx("color:#0A5688;font-weight:700")}>
            ログイン
          </Link>
        </>
      }
    >
      <form action={formAction}>
        {state?.error && <div style={errorStyle}>{state.error}</div>}

        <div style={sx("margin-bottom:14px")}>
          <label htmlFor="displayName" style={labelStyle}>
            システム表示名
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="例：山田 太郎"
            required
            style={fieldStyle}
          />
        </div>

        <div style={sx("margin-bottom:14px")}>
          <label htmlFor="orgName" style={labelStyle}>
            組織名・会社名（新規に立ち上げる方のみ）
          </label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            placeholder="例：Coast Tours 沖縄"
            style={fieldStyle}
          />
          <div style={sx("font-size:11px;color:#7A93A6;margin-top:5px;line-height:1.5")}>
            スタッフとして参加する方は空欄のまま、下の「招待コード」を入力してください。
          </div>
        </div>

        <div style={sx("margin-bottom:14px")}>
          <label htmlFor="inviteCode" style={labelStyle}>
            招待コード（スタッフの方のみ）
          </label>
          <input
            id="inviteCode"
            name="inviteCode"
            type="text"
            autoComplete="off"
            placeholder="オーナーから受け取ったコード"
            style={fieldStyle}
          />
        </div>

        <div style={sx("margin-bottom:14px")}>
          <label htmlFor="email" style={labelStyle}>
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={fieldStyle}
          />
        </div>

        <div style={sx("margin-bottom:20px")}>
          <label htmlFor="password" style={labelStyle}>
            パスワード（6 文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            style={fieldStyle}
          />
        </div>

        <SubmitButton />
      </form>
    </AuthShell>
  );
}
