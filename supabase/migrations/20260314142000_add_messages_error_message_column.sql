alter table public.messages
add column if not exists error_message text;

create index if not exists messages_org_status_received_idx
on public.messages (organization_id, status, received_at desc);
