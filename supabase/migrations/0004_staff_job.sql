-- スタッフ職種（ops=本部 / guide=ガイド / driver=ドライバー）
-- ------------------------------------------------------------------
-- チャットの「便グループ」自動メンバー化の土台として、プロフィールに職種を持たせる。
--   * profiles.job    … 本人の職種（既定 'ops'）
--   * invitations.job … 招待で参加した人に付与する職種（既定 'guide'）
-- handle_new_user を更新し、招待経由なら invitations.job を引き継ぐ。
-- 権限（owner/staff・perms）とは独立。job は表示・アサイン絞り込み・便グループ招集に使う。
-- ------------------------------------------------------------------

alter table public.profiles
  add column if not exists job text not null default 'ops'
  check (job in ('ops', 'guide', 'driver'));

alter table public.invitations
  add column if not exists job text not null default 'guide'
  check (job in ('ops', 'guide', 'driver'));

-- サインアップ時のプロフィール自動生成に job を反映
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
  v_job      text := 'ops';
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
    v_job   := coalesce(v_inv.job, 'guide');

    update public.invitations
    set accepted_at = now(), accepted_by = new.id
    where id = v_inv.id;
  else
    -- 招待なし → 新しい組織を作り owner（本部）になる
    insert into public.organizations (name) values (v_org_name) returning id into v_org;
    v_role := 'owner';
    v_job  := 'ops';
  end if;

  insert into public.profiles (user_id, org_id, role, display_name, perms, job)
  values (new.id, v_org, v_role, v_name, v_perms, v_job);

  return new;
end;
$$;
