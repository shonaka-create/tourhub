import { createClient } from "@/lib/supabase/client";

// 組織メンバーの操作権限（オーナーは常に全許可扱い）
export interface MemberPerms {
  booking: boolean; // 予約編集
  assign: boolean; // アサイン
  sales: boolean; // 売上閲覧
  settings: boolean; // 設定変更
}

export const EMPTY_PERMS: MemberPerms = {
  booking: false,
  assign: false,
  sales: false,
  settings: false,
};

export type Role = "owner" | "staff";

// 職種（本部 / ガイド / ドライバー）。権限(role/perms)とは独立。
// 便グループの自動メンバー化やアサインの絞り込みに使う。
export type Job = "ops" | "guide" | "driver";

export const JOB_LABELS: Record<Job, string> = {
  ops: "本部",
  guide: "ガイド",
  driver: "ドライバー",
};

// 組織に所属する 1 メンバー（profiles 1 行）
export interface Member {
  userId: string;
  displayName: string;
  role: Role;
  job: Job;
  perms: MemberPerms;
  active: boolean;
}

// 招待 1 件
export interface Invite {
  id: string;
  code: string;
  role: Role;
  job: Job;
  perms: MemberPerms;
  email: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
}

function toPerms(raw: unknown): MemberPerms {
  const p = (raw ?? {}) as Partial<MemberPerms>;
  return {
    booking: !!p.booking,
    assign: !!p.assign,
    sales: !!p.sales,
    settings: !!p.settings,
  };
}

function toJob(raw: unknown): Job {
  return raw === "guide" || raw === "driver" ? raw : "ops";
}

function memberFromRow(r: any): Member {
  return {
    userId: r.user_id,
    displayName: r.display_name ?? "",
    role: r.role === "owner" ? "owner" : "staff",
    job: toJob(r.job),
    perms: toPerms(r.perms),
    active: r.active !== false,
  };
}

function inviteFromRow(r: any): Invite {
  return {
    id: r.id,
    code: r.code,
    role: r.role === "owner" ? "owner" : "staff",
    job: toJob(r.job),
    perms: toPerms(r.perms),
    email: r.email ?? "",
    expiresAt: r.expires_at ?? null,
    acceptedAt: r.accepted_at ?? null,
    createdAt: r.created_at,
  };
}

// ログイン中ユーザー自身のプロフィール（ロール判定・権限ゲート用）
export async function fetchMyProfile(): Promise<Member | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", auth.user.id)
    .single();
  if (error) return null;
  return memberFromRow(data);
}

// 所属組織のメンバー一覧（RLS により同じ org のみ返る）
export async function fetchMembers(): Promise<Member[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("role", { ascending: true }) // owner が先頭
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(memberFromRow);
}

// メンバーの操作権限を更新（オーナーのみ・RLS で保護）
export async function updateMemberPerms(
  userId: string,
  perms: MemberPerms
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ perms })
    .eq("user_id", userId);
  if (error) throw error;
}

// メンバーのロールを更新（owner / staff の付け替え）
export async function updateMemberRole(
  userId: string,
  role: Role
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("user_id", userId);
  if (error) throw error;
}

// メンバーの職種を更新（本部 / ガイド / ドライバー）
export async function updateMemberJob(
  userId: string,
  job: Job
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ job })
    .eq("user_id", userId);
  if (error) throw error;
}

// メンバーの有効 / 無効を切り替え（退職者の凍結など）
export async function setMemberActive(
  userId: string,
  active: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ active })
    .eq("user_id", userId);
  if (error) throw error;
}

// 招待一覧
export async function fetchInvites(): Promise<Invite[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(inviteFromRow);
}

// 招待を発行し、発行された招待（コード付き）を返す。
// org_id は DB 側の default public.auth_org_id() で自動設定される。
export async function createInvite(
  role: Role,
  perms: MemberPerms,
  job: Job = "guide",
  email?: string,
  expiresInDays = 14
): Promise<Invite> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const expires_at = new Date(
    Date.now() + expiresInDays * 24 * 60 * 60 * 1000
  ).toISOString();
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      role,
      perms,
      job,
      email: email || null,
      invited_by: auth.user?.id ?? null,
      expires_at,
    })
    .select()
    .single();
  if (error) throw error;
  return inviteFromRow(data);
}

// 招待を取り消し
export async function deleteInvite(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
}
