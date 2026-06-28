import { createClient } from "@supabase/supabase-js";

// service_role を使う管理者クライアント。RLS をバイパスするため
// 必ずサーバー側（Route Handler / Server Action）でのみ利用すること。
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
