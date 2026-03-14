create extension if not exists pgcrypto;
create schema if not exists app_private;
revoke all on schema app_private from public;

create type public.app_role as enum ('owner', 'admin', 'operator', 'viewer');
create type public.organization_status as enum ('active', 'inactive');
create type public.member_status as enum ('active', 'invited', 'suspended');
create type public.system_type as enum (
  'ehr',
  'emr',
  'lis',
  'ris',
  'pacs',
  'billing',
  'fhir_server',
  'hl7_broker',
  'api',
  'internal',
  'other'
);
create type public.resource_status as enum ('active', 'inactive', 'draft');
create type public.channel_type as enum ('hl7', 'fhir', 'api', 'sftp', 'webhook', 'manual');
create type public.flow_direction as enum ('inbound', 'outbound', 'bidirectional');
create type public.connection_status as enum ('draft', 'active', 'paused', 'error', 'archived');
create type public.message_status as enum (
  'received',
  'queued',
  'processing',
  'transformed',
  'delivered',
  'failed',
  'acknowledged'
);
create type public.log_level as enum ('info', 'warn', 'error');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'insert' and new.created_at is null then
    new.created_at = timezone('utc', now());
  end if;

  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.set_actor_tracking()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if tg_op = 'insert' and new.created_by is null then
    new.created_by = auth.uid();
  end if;

  if new.updated_by is null or tg_op = 'update' then
    new.updated_by = auth.uid();
  end if;

  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index profiles_email_unique_idx on public.profiles (lower(email)) where email <> '';

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  status public.organization_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organizations_name_not_blank check (btrim(name) <> ''),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index organizations_slug_unique_idx on public.organizations (lower(slug));
create index organizations_created_by_idx on public.organizations (created_by);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  status public.member_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organization_members_unique unique (organization_id, user_id)
);

create index organization_members_user_idx on public.organization_members (user_id);
create index organization_members_org_role_idx on public.organization_members (organization_id, role);
create index organization_members_org_status_idx on public.organization_members (organization_id, status);

create table public.systems (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  system_type public.system_type not null,
  vendor text,
  description text,
  status public.resource_status not null default 'active',
  config jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint systems_name_not_blank check (btrim(name) <> ''),
  constraint systems_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index systems_org_slug_unique_idx on public.systems (organization_id, lower(slug));
create index systems_org_type_idx on public.systems (organization_id, system_type);
create index systems_org_status_idx on public.systems (organization_id, status);

create table public.channels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  channel_type public.channel_type not null,
  direction public.flow_direction not null default 'bidirectional',
  endpoint_url text,
  status public.resource_status not null default 'active',
  config jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint channels_name_not_blank check (btrim(name) <> ''),
  constraint channels_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index channels_org_slug_unique_idx on public.channels (organization_id, lower(slug));
create index channels_org_type_idx on public.channels (organization_id, channel_type);
create index channels_org_status_idx on public.channels (organization_id, status);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  source_system_id uuid not null references public.systems(id) on delete restrict,
  target_system_id uuid not null references public.systems(id) on delete restrict,
  channel_id uuid not null references public.channels(id) on delete restrict,
  status public.connection_status not null default 'draft',
  retry_policy jsonb not null default '{"max_attempts":3,"backoff_seconds":60}'::jsonb,
  config jsonb not null default '{}'::jsonb,
  last_heartbeat_at timestamptz,
  last_error_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint connections_name_not_blank check (btrim(name) <> ''),
  constraint connections_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint connections_distinct_systems check (source_system_id <> target_system_id)
);

create unique index connections_org_slug_unique_idx on public.connections (organization_id, lower(slug));
create index connections_org_status_idx on public.connections (organization_id, status);
create index connections_source_system_idx on public.connections (source_system_id);
create index connections_target_system_idx on public.connections (target_system_id);
create index connections_channel_idx on public.connections (channel_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  connection_id uuid references public.connections(id) on delete set null,
  channel_id uuid references public.channels(id) on delete set null,
  source_system_id uuid references public.systems(id) on delete set null,
  target_system_id uuid references public.systems(id) on delete set null,
  direction public.flow_direction not null,
  message_type text not null,
  content_type text not null default 'application/json',
  external_id text,
  correlation_id text,
  raw_payload text,
  payload jsonb,
  transformed_payload jsonb,
  status public.message_status not null default 'received',
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  failed_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint messages_type_not_blank check (btrim(message_type) <> ''),
  constraint messages_payload_present check (raw_payload is not null or payload is not null)
);

create index messages_org_received_idx on public.messages (organization_id, received_at desc);
create index messages_org_status_idx on public.messages (organization_id, status);
create index messages_connection_status_idx on public.messages (connection_id, status);
create index messages_channel_idx on public.messages (channel_id);
create index messages_external_id_idx on public.messages (organization_id, external_id);
create index messages_correlation_id_idx on public.messages (organization_id, correlation_id);

create table public.message_logs (
  id bigint generated by default as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  connection_id uuid references public.connections(id) on delete set null,
  level public.log_level not null default 'info',
  event text not null,
  details text,
  metadata jsonb not null default '{}'::jsonb,
  logged_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint message_logs_event_not_blank check (btrim(event) <> '')
);

create index message_logs_message_created_idx on public.message_logs (message_id, created_at desc);
create index message_logs_org_level_created_idx on public.message_logs (organization_id, level, created_at desc);
create index message_logs_connection_created_idx on public.message_logs (connection_id, created_at desc);

create table public.transformations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete cascade,
  connection_id uuid references public.connections(id) on delete cascade,
  name text not null,
  source_format text not null,
  target_format text not null,
  rule_config jsonb not null default '{}'::jsonb,
  status public.resource_status not null default 'active',
  version integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint transformations_name_not_blank check (btrim(name) <> ''),
  constraint transformations_positive_version check (version > 0),
  constraint transformations_scope_check check (
    channel_id is not null or connection_id is not null
  )
);

create index transformations_org_status_idx on public.transformations (organization_id, status);
create index transformations_channel_idx on public.transformations (channel_id);
create index transformations_connection_idx on public.transformations (connection_id);

create table public.audit_logs (
  id bigint generated by default as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role public.app_role,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  correlation_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint audit_logs_action_not_blank check (btrim(action) <> ''),
  constraint audit_logs_entity_type_not_blank check (btrim(entity_type) <> '')
);

create index audit_logs_org_created_idx on public.audit_logs (organization_id, created_at desc);
create index audit_logs_actor_created_idx on public.audit_logs (actor_user_id, created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);
create index audit_logs_correlation_idx on public.audit_logs (correlation_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, email)
select u.id, coalesce(u.email, '')
from auth.users u
on conflict (id) do nothing;

create or replace function app_private.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_org_id uuid;
  audit_actor_role public.app_role;
  audit_entity_id uuid;
begin
  if tg_op = 'DELETE' then
    audit_entity_id := old.id;
  elsif tg_op = 'INSERT' then
    audit_entity_id := new.id;
  else
    audit_entity_id := coalesce(new.id, old.id);
  end if;

  if tg_table_name = 'organizations' then
    if tg_op = 'DELETE' then
      audit_org_id := old.id;
    elsif tg_op = 'INSERT' then
      audit_org_id := new.id;
    else
      audit_org_id := coalesce(new.id, old.id);
    end if;
  else
    if tg_op = 'DELETE' then
      audit_org_id := old.organization_id;
    elsif tg_op = 'INSERT' then
      audit_org_id := new.organization_id;
    else
      audit_org_id := coalesce(new.organization_id, old.organization_id);
    end if;
  end if;

  if auth.uid() is not null and audit_org_id is not null then
    select om.role
      into audit_actor_role
    from public.organization_members om
    where om.organization_id = audit_org_id
      and om.user_id = auth.uid()
      and om.status = 'active'
    limit 1;
  end if;

  insert into public.audit_logs (
    organization_id,
    actor_user_id,
    actor_role,
    action,
    entity_type,
    entity_id,
    before_data,
    after_data,
    metadata
  )
  values (
    audit_org_id,
    auth.uid(),
    audit_actor_role,
    lower(tg_op),
    tg_table_name,
    audit_entity_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    jsonb_build_object('schema', tg_table_schema)
  );

  return coalesce(new, old);
end;
$$;

create trigger set_profiles_updated_at
before insert or update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_organizations_updated_at
before insert or update on public.organizations
for each row execute function public.set_updated_at();

create trigger set_organization_members_updated_at
before insert or update on public.organization_members
for each row execute function public.set_updated_at();

create trigger set_systems_updated_at
before insert or update on public.systems
for each row execute function public.set_updated_at();

create trigger set_channels_updated_at
before insert or update on public.channels
for each row execute function public.set_updated_at();

create trigger set_connections_updated_at
before insert or update on public.connections
for each row execute function public.set_updated_at();

create trigger set_messages_updated_at
before insert or update on public.messages
for each row execute function public.set_updated_at();

create trigger set_message_logs_updated_at
before insert or update on public.message_logs
for each row execute function public.set_updated_at();

create trigger set_transformations_updated_at
before insert or update on public.transformations
for each row execute function public.set_updated_at();

create trigger set_audit_logs_updated_at
before insert or update on public.audit_logs
for each row execute function public.set_updated_at();

create trigger set_organizations_actor_tracking
before insert or update on public.organizations
for each row execute function public.set_actor_tracking();

create trigger set_organization_members_actor_tracking
before insert or update on public.organization_members
for each row execute function public.set_actor_tracking();

create trigger set_systems_actor_tracking
before insert or update on public.systems
for each row execute function public.set_actor_tracking();

create trigger set_channels_actor_tracking
before insert or update on public.channels
for each row execute function public.set_actor_tracking();

create trigger set_connections_actor_tracking
before insert or update on public.connections
for each row execute function public.set_actor_tracking();

create trigger set_messages_actor_tracking
before insert or update on public.messages
for each row execute function public.set_actor_tracking();

create trigger set_transformations_actor_tracking
before insert or update on public.transformations
for each row execute function public.set_actor_tracking();

create trigger audit_organizations_changes
after insert or update or delete on public.organizations
for each row execute function app_private.write_audit_log();

create trigger audit_organization_members_changes
after insert or update or delete on public.organization_members
for each row execute function app_private.write_audit_log();

create trigger audit_systems_changes
after insert or update or delete on public.systems
for each row execute function app_private.write_audit_log();

create trigger audit_channels_changes
after insert or update or delete on public.channels
for each row execute function app_private.write_audit_log();

create trigger audit_connections_changes
after insert or update or delete on public.connections
for each row execute function app_private.write_audit_log();

create trigger audit_transformations_changes
after insert or update or delete on public.transformations
for each row execute function app_private.write_audit_log();
