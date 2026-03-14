alter table public.organizations
drop constraint if exists organizations_slug_format;

alter table public.organizations
add constraint organizations_slug_format
check (slug ~ '^[a-z0-9]+(?:[_-][a-z0-9]+)*$');

create or replace function public.create_organization(
  p_name text,
  p_status public.organization_status default 'active'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_base_slug text;
  v_slug text;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Organization name is required';
  end if;

  v_base_slug := regexp_replace(lower(btrim(p_name)), '[^a-z0-9]+', '_', 'g');
  v_base_slug := trim(both '_' from v_base_slug);

  if v_base_slug = '' then
    v_base_slug := 'organization';
  end if;

  v_slug := v_base_slug;

  if exists (
    select 1
    from public.organizations o
    where lower(o.slug) = lower(v_slug)
  ) then
    v_slug := v_base_slug || '_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
  end if;

  insert into public.organizations (
    name,
    slug,
    status,
    created_by,
    updated_by
  )
  values (
    btrim(p_name),
    v_slug,
    p_status,
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
    'owner',
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

grant execute on function public.create_organization(text, public.organization_status) to authenticated;
