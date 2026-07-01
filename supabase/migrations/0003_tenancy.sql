-- マルチテナント基盤
-- ------------------------------------------------------------------
-- これまでは「ユーザーごと」にデータを分離していた（RLS: auth.uid() = user_id）が、
-- マルチテナント（1組織 = オーナー + スタッフ が同じデータを共有）へ移行する。
--
-- 方針:
--   * テナントの単位 = organizations（組織）
--   * 1ユーザー1組織（profiles.org_id で所属を一意に決定）
--   * ロールは profiles.role（'owner' / 'staff'）。細かな操作権限は profiles.perms(jsonb)
--   * 新規登録は「招待制」:
--       - 招待コードなし → 新しい組織を作成し、その人が owner
--       - 招待コードあり → 招待の org / role / perms を引き継いで join（= staff）
--   * 業務テーブル（sales / tours / 今後追加分）は org_id で束ね、RLS を org 単位に書き換え
-- ------------------------------------------------------------------

create extension if not exists "pgcrypto";

-- ── 組織（テナント）─────────────────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- ── プロフィール（ユーザー ↔ 組織 ↔ ロール）──────────────────────
create table if not exists public.profiles (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  org_id       uuid not null references public.organizations (id) on delete cascade,
  role         text not null default 'staff' check (role in ('owner', 'staff')),
  display_name text not null default '',
  perms        jsonb not null default '{}'::jsonb,  -- { booking, assign, sales, settings } など
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create index if not exists profiles_org_id_idx on public.profiles (org_id);

-- ── 招待 ────────────────────────────────────────────────────────
create table if not exists public.invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations (id) on delete cascade,
  email       text,                                         -- 任意（宛先メモ用）
  code        text not null unique default encode(gen_random_bytes(6), 'hex'),
  role        text not null default 'staff' check (role in ('owner', 'staff')),
  perms       jsonb not null default '{}'::jsonb,
  invited_by  uuid references auth.users (id) on delete set null,
  accepted_by uuid references auth.users (id) on delete set null,
  expires_at  timestamptz,
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists invitations_org_id_idx on public.invitations (org_id);

-- ── ヘルパー関数 ────────────────────────────────────────────────
-- ログイン中ユーザーの org_id を返す。RLS の再帰を避けるため SECURITY DEFINER。
create or replace function public.auth_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select org_id from public.profiles where user_id = auth.uid()
$$;

-- ログイン中ユーザーが所属組織のオーナーか。
create or replace function public.auth_is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'owner'
  )
$$;

-- ── サインアップ時に profiles / organizations を自動生成するトリガー ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code     text := nullif(trim(new.raw_user_meta_data->>'invite_code'), '');
  v_name     text := coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
                              split_part(new.email, '@', 1));
  v_org_name text := coalesce(nullif(trim(new.raw_user_meta_data->>'org_name'), ''),
                              v_name || 'の組織');
  v_org      uuid;
  v_role     text;
  v_perms    jsonb := '{}'::jsonb;
  v_inv      public.invitations%rowtype;
begin
  if v_code is not null then
    -- 招待コードで join
    select * into v_inv
    from public.invitations
    where code = v_code
      and accepted_at is null
      and (expires_at is null or expires_at > now())
    limit 1;

    if v_inv.id is null then
      raise exception 'invalid_invite_code';
    end if;

    v_org   := v_inv.org_id;
    v_role  := v_inv.role;
    v_perms := v_inv.perms;

    update public.invitations
    set accepted_at = now(), accepted_by = new.id
    where id = v_inv.id;
  else
    -- 招待なし → 新しい組織を作り owner になる
    insert into public.organizations (name) values (v_org_name) returning id into v_org;
    v_role := 'owner';
  end if;

  insert into public.profiles (user_id, org_id, role, display_name, perms)
  values (new.id, v_org, v_role, v_name, v_perms);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 既存ユーザーの移行（profiles 未作成の auth.users を owner として組織化）──
do $$
declare
  r      record;
  v_org  uuid;
  v_name text;
begin
  for r in
    select u.id, u.email, u.raw_user_meta_data
    from auth.users u
    where not exists (select 1 from public.profiles p where p.user_id = u.id)
  loop
    v_name := coalesce(nullif(trim(r.raw_user_meta_data->>'display_name'), ''),
                       split_part(r.email, '@', 1));
    insert into public.organizations (name) values (v_name || 'の組織') returning id into v_org;
    insert into public.profiles (user_id, org_id, role, display_name)
    values (r.id, v_org, 'owner', v_name);
  end loop;
end $$;

-- ── sales / tours に org_id を付与して org 単位に束ねる ─────────────
alter table public.sales add column if not exists org_id uuid references public.organizations (id) on delete cascade;
update public.sales s set org_id = p.org_id from public.profiles p where p.user_id = s.user_id and s.org_id is null;
alter table public.sales alter column org_id set not null;
alter table public.sales alter column org_id set default public.auth_org_id();
create index if not exists sales_org_id_idx on public.sales (org_id);

alter table public.tours add column if not exists org_id uuid references public.organizations (id) on delete cascade;
update public.tours t set org_id = p.org_id from public.profiles p where p.user_id = t.user_id and t.org_id is null;
alter table public.tours alter column org_id set not null;
alter table public.tours alter column org_id set default public.auth_org_id();
create index if not exists tours_org_id_idx on public.tours (org_id);

-- ── RLS: organizations / profiles / invitations ──────────────────
alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.invitations   enable row level security;

drop policy if exists "org_select_member" on public.organizations;
create policy "org_select_member" on public.organizations
  for select using (id = public.auth_org_id());

drop policy if exists "org_update_owner" on public.organizations;
create policy "org_update_owner" on public.organizations
  for update using (public.auth_is_owner() and id = public.auth_org_id())
  with check (id = public.auth_org_id());

drop policy if exists "profiles_select_org" on public.profiles;
create policy "profiles_select_org" on public.profiles
  for select using (org_id = public.auth_org_id());

-- オーナーは同じ組織のメンバーの role / perms / active を編集できる
drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner" on public.profiles
  for update using (public.auth_is_owner() and org_id = public.auth_org_id())
  with check (org_id = public.auth_org_id());

-- オーナーは同じ組織のメンバー（自分以外）を削除できる
drop policy if exists "profiles_delete_owner" on public.profiles;
create policy "profiles_delete_owner" on public.profiles
  for delete using (
    public.auth_is_owner() and org_id = public.auth_org_id() and user_id <> auth.uid()
  );
-- 注: profiles の insert は handle_new_user（SECURITY DEFINER）経由のみ。クライアント insert は許可しない。

drop policy if exists "inv_select_org" on public.invitations;
create policy "inv_select_org" on public.invitations
  for select using (org_id = public.auth_org_id());

drop policy if exists "inv_insert_owner" on public.invitations;
create policy "inv_insert_owner" on public.invitations
  for insert with check (public.auth_is_owner() and org_id = public.auth_org_id());

drop policy if exists "inv_delete_owner" on public.invitations;
create policy "inv_delete_owner" on public.invitations
  for delete using (public.auth_is_owner() and org_id = public.auth_org_id());

-- ── RLS: sales を org 単位へ書き換え（旧 user 単位ポリシーを置換）──
drop policy if exists "sales_select_own" on public.sales;
drop policy if exists "sales_insert_own" on public.sales;
drop policy if exists "sales_update_own" on public.sales;
drop policy if exists "sales_delete_own" on public.sales;

create policy "sales_select_org" on public.sales
  for select using (org_id = public.auth_org_id());
create policy "sales_insert_org" on public.sales
  for insert with check (org_id = public.auth_org_id());
create policy "sales_update_org" on public.sales
  for update using (org_id = public.auth_org_id()) with check (org_id = public.auth_org_id());
create policy "sales_delete_org" on public.sales
  for delete using (org_id = public.auth_org_id());

-- ── RLS: tours を org 単位へ書き換え ─────────────────────────────
drop policy if exists "tours_select_own" on public.tours;
drop policy if exists "tours_insert_own" on public.tours;
drop policy if exists "tours_update_own" on public.tours;
drop policy if exists "tours_delete_own" on public.tours;

create policy "tours_select_org" on public.tours
  for select using (org_id = public.auth_org_id());
create policy "tours_insert_org" on public.tours
  for insert with check (org_id = public.auth_org_id());
create policy "tours_update_org" on public.tours
  for update using (org_id = public.auth_org_id()) with check (org_id = public.auth_org_id());
create policy "tours_delete_org" on public.tours
  for delete using (org_id = public.auth_org_id());
