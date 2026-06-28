import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { sx } from "@/lib/sx";

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;

  return (
    <AuthShell
      title="確認メールを送信しました"
      subtitle="メール内のリンクを開いて登録を完了してください"
      footer={
        <Link href="/login" style={sx("color:#0A5688;font-weight:700")}>
          ログイン画面へ
        </Link>
      }
    >
      <div style={sx("font-size:13px;color:#37536A;line-height:1.7")}>
        {email && (
          <p style={sx("margin:0 0 12px")}>
            <strong>{email}</strong> 宛に確認メールを送信しました。
          </p>
        )}
        <p style={sx("margin:0 0 12px")}>
          メール内の認証リンクをクリックすると、メールアドレスの確認が完了し、ログインできるようになります。
        </p>
        <p style={sx("margin:0;font-size:12px;color:#6E8BA0")}>
          メールが届かない場合は、迷惑メールフォルダもご確認ください。
        </p>
      </div>
    </AuthShell>
  );
}
