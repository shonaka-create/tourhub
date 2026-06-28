"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/auth/actions";
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
      {pending ? "ログイン中…" : "ログイン"}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, undefined);

  return (
    <AuthShell
      title="ログイン"
      subtitle="登録済みのメールアドレスでサインインしてください"
      footer={
        <>
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" style={sx("color:#0A5688;font-weight:700")}>
            新規登録
          </Link>
        </>
      }
    >
      <form action={formAction}>
        {state?.error && <div style={errorStyle}>{state.error}</div>}

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
            パスワード
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={fieldStyle}
          />
        </div>

        <SubmitButton />
      </form>
    </AuthShell>
  );
}
