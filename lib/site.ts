// サイトの公開 URL を組み立てる。メール認証のリダイレクト先などに使う。
// Vercel 本番では NEXT_PUBLIC_SITE_URL を設定する。未設定ならローカルを想定。
export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000";

  // スキームが無ければ https を補う（VERCEL_URL は host だけのため）
  url = url.startsWith("http") ? url : `https://${url}`;
  // 末尾のスラッシュを 1 つに正規化
  return url.endsWith("/") ? url : `${url}/`;
}
