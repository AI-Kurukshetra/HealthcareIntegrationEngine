create schema if not exists app_private;
revoke all on schema app_private from public;

create or replace function app_private.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
  );
$$;

create or replace function app_private.has_org_role(org_id uuid, allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
      and om.role = any(allowed_roles)
  );
$$;

create or replace function app_private.can_manage_member_role(org_id uuid, desired_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    app_private.has_org_role(org_id, array['owner']::public.app_role[])
    or (
      desired_role <> 'owner'
      and app_private.has_org_role(org_id, array['admin']::public.app_role[])
    );
$$;

grant usage on schema app_private to authenticated;
grant execute on function app_private.is_org_member(uuid) to authenticated;
grant execute on function app_private.has_org_role(uuid, public.app_role[]) to authenticated;
grant execute on function app_private.can_manage_member_role(uuid, public.app_role) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.systems enable row level security;
alter table public.channels enable row level security;
alter table public.connections enable row level security;
alter table public.messages enable row level security;
alter table public.message_logs enable row level security;
alter table public.transformations enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "organizations_select_for_members"
on public.organizations
for select
to authenticated
using (app_private.is_org_member(id));

create policy "organizations_insert_for_authenticated"
on public.organizations
for insert
to authenticated
with check ((select auth.uid()) is not null and created_by = (select auth.uid()));

create policy "organizations_update_for_admins"
on public.organizations
for update
to authenticated
using (app_private.has_org_role(id, array['owner', 'admin']::public.app_role[]))
with check (app_private.has_org_role(id, array['owner', 'admin']::public.app_role[]));

create policy "organizations_delete_for_owners"
on public.organizations
for delete
to authenticated
using (app_private.has_org_role(id, array['owner']::public.app_role[]));

create policy "organization_members_select_for_members"
on public.organization_members
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "organization_members_insert_for_managers"
on public.organization_members
for insert
to authenticated
with check (
  app_private.can_manage_member_role(organization_id, role)
  or (
    user_id = (select auth.uid())
    and role = 'owner'
    and exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.created_by = (select auth.uid())
    )
  )
);

create policy "organization_members_update_for_managers"
on public.organization_members
for update
to authenticated
using (app_private.can_manage_member_role(organization_id, role))
with check (app_private.can_manage_member_role(organization_id, role));

create policy "organization_members_delete_for_managers"
on public.organization_members
for delete
to authenticated
using (app_private.can_manage_member_role(organization_id, role));

create policy "systems_select_for_members"
on public.systems
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "systems_write_for_admins"
on public.systems
for all
to authenticated
using (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
with check (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

create policy "channels_select_for_members"
on public.channels
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "channels_write_for_admins"
on public.channels
for all
to authenticated
using (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
with check (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

create policy "connections_select_for_members"
on public.connections
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "connections_write_for_admins"
on public.connections
for all
to authenticated
using (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
with check (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

create policy "messages_select_for_members"
on public.messages
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "messages_insert_for_ops"
on public.messages
for insert
to authenticated
with check (
  app_private.has_org_role(organization_id, array['owner', 'admin', 'operator']::public.app_role[])
);

create policy "messages_update_for_ops"
on public.messages
for update
to authenticated
using (
  app_private.has_org_role(organization_id, array['owner', 'admin', 'operator']::public.app_role[])
)
with check (
  app_private.has_org_role(organization_id, array['owner', 'admin', 'operator']::public.app_role[])
);

create policy "message_logs_select_for_members"
on public.message_logs
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "message_logs_insert_for_ops"
on public.message_logs
for insert
to authenticated
with check (
  app_private.has_org_role(organization_id, array['owner', 'admin', 'operator']::public.app_role[])
);

create policy "transformations_select_for_members"
on public.transformations
for select
to authenticated
using (app_private.is_org_member(organization_id));

create policy "transformations_write_for_admins"
on public.transformations
for all
to authenticated
using (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]))
with check (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));

create policy "audit_logs_select_for_admins"
on public.audit_logs
for select
to authenticated
using (app_private.has_org_role(organization_id, array['owner', 'admin']::public.app_role[]));
