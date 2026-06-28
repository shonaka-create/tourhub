import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { sx } from "@/lib/sx";

export default function AuthCodeErrorPage() {
  return (
    <AuthShell
      title="認証に失敗しました"
      subtitle="リンクの有効期限が切れているか、無効です"
      footer={
        <Link href="/login" style={sx("color:#0A5688;font-weight:700")}>
          ログイン画面へ
        </Link>
      }
    >
      <div style={sx("font-size:13px;color:#37536A;line-height:1.7")}>
        <p style={sx("margin:0 0 12px")}>
          メール認証のリンクが無効か、有効期限が切れている可能性があります。
        </p>
        <p style={sx("margin:0")}>
          お手数ですが、もう一度{" "}
          <Link href="/signup" style={sx("color:#0A5688;font-weight:700")}>
            新規登録
          </Link>{" "}
          をお試しください。
        </p>
      </div>
    </AuthShell>
  );
}
