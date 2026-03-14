alter table public.profiles
add column current_organization_id uuid references public.organizations(id) on delete set null;

create index profiles_current_organization_idx
on public.profiles (current_organization_id);

create or replace function public.bootstrap_new_user(
  p_organization_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_org_id uuid;
  v_base_slug text;
  v_slug text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_organization_name is null or btrim(p_organization_name) = '' then
    raise exception 'Organization name is required';
  end if;

  select coalesce(u.email, '')
    into v_email
  from auth.users u
  where u.id = v_user_id;

  insert into public.profiles (id, email)
  values (v_user_id, coalesce(v_email, ''))
  on conflict (id) do nothing;

  select p.current_organization_id
    into v_org_id
  from public.profiles p
  where p.id = v_user_id;

  if v_org_id is not null then
    return v_org_id;
  end if;

  select om.organization_id
    into v_org_id
  from public.organization_members om
  where om.user_id = v_user_id
    and om.status = 'active'
  order by om.created_at asc
  limit 1;

  if v_org_id is not null then
    update public.profiles
    set current_organization_id = v_org_id,
        updated_at = timezone('utc', now())
    where id = v_user_id;

    return v_org_id;
  end if;

  v_base_slug := regexp_replace(lower(btrim(p_organization_name)), '[^a-z0-9]+', '-', 'g');
  v_base_slug := trim(both '-' from v_base_slug);

  if v_base_slug = '' then
    v_base_slug := 'organization';
  end if;

  v_slug := v_base_slug;

  if exists (
    select 1
    from public.organizations o
    where lower(o.slug) = lower(v_slug)
  ) then
    v_slug := v_base_slug || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end if;

  insert into public.organizations (
    name,
    slug,
    status,
    created_by,
    updated_by
  )
  values (
    btrim(p_organization_name),
    v_slug,
    'active',
    v_user_id,
    v_user_id
  )
  returning id into v_org_id;

  insert into public.organization_members (
    organization_id,
    user_id,
    role,
    status,
    created_by,
    updated_by
  )
  values (
    v_org_id,
    v_user_id,
    'admin',
    'active',
    v_user_id,
    v_user_id
  );

  update public.profiles
  set current_organization_id = v_org_id,
      updated_at = timezone('utc', now())
  where id = v_user_id;

  return v_org_id;
end;
$$;

create or replace function public.set_current_organization(
  p_organization_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.organization_members om
    where om.organization_id = p_organization_id
      and om.user_id = v_user_id
      and om.status = 'active'
  ) then
    raise exception 'Organization access denied';
  end if;

  update public.profiles
  set current_organization_id = p_organization_id,
      updated_at = timezone('utc', now())
  where id = v_user_id;
end;
$$;

grant execute on function public.bootstrap_new_user(text) to authenticated;
grant execute on function public.set_current_organization(uuid) to authenticated;

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);
