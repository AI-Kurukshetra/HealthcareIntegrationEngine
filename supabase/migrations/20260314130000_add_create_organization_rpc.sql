create or replace function public.create_organization(
  p_name text,
  p_slug text,
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
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'Organization name is required';
  end if;

  if p_slug is null or btrim(p_slug) = '' then
    raise exception 'Organization slug is required';
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
    btrim(p_slug),
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

grant execute on function public.create_organization(text, text, public.organization_status) to authenticated;
