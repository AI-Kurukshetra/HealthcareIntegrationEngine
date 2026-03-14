do $$
declare
  org record;
  v_source_system_id uuid;
  v_target_system_id uuid;
  v_channel_id uuid;
  v_connection_active_id uuid;
  v_connection_error_id uuid;
  v_message_1_id uuid;
  v_message_2_id uuid;
begin
  for org in
    select o.id, o.name
    from public.organizations o
  loop
    select s.id
      into v_source_system_id
    from public.systems s
    where s.organization_id = org.id
      and lower(s.slug) = 'demo-ehr'
    limit 1;

    if v_source_system_id is null then
      insert into public.systems (
        organization_id,
        name,
        slug,
        system_type,
        status,
        config
      )
      values (
        org.id,
        org.name || ' EHR',
        'demo-ehr',
        'ehr',
        'active',
        '{"vendor":"Demo Vendor"}'::jsonb
      )
      returning id into v_source_system_id;
    end if;

    select s.id
      into v_target_system_id
    from public.systems s
    where s.organization_id = org.id
      and lower(s.slug) = 'demo-lab'
    limit 1;

    if v_target_system_id is null then
      insert into public.systems (
        organization_id,
        name,
        slug,
        system_type,
        status,
        config
      )
      values (
        org.id,
        'Lab Vendor API',
        'demo-lab',
        'lis',
        'active',
        '{"vendor":"Lab Systems Inc."}'::jsonb
      )
      returning id into v_target_system_id;
    end if;

    select c.id
      into v_channel_id
    from public.channels c
    where c.organization_id = org.id
      and lower(c.slug) = 'demo-hl7'
    limit 1;

    if v_channel_id is null then
      insert into public.channels (
        organization_id,
        name,
        slug,
        channel_type,
        direction,
        status,
        config
      )
      values (
        org.id,
        'HL7 Feed',
        'demo-hl7',
        'hl7',
        'bidirectional',
        'active',
        '{"version":"2.5"}'::jsonb
      )
      returning id into v_channel_id;
    end if;

    select c.id
      into v_connection_active_id
    from public.connections c
    where c.organization_id = org.id
      and lower(c.slug) = 'demo-primary-feed'
    limit 1;

    if v_connection_active_id is null then
      insert into public.connections (
        organization_id,
        name,
        slug,
        source_system_id,
        target_system_id,
        channel_id,
        status,
        config,
        last_heartbeat_at
      )
      values (
        org.id,
        'Primary Clinical Feed',
        'demo-primary-feed',
        v_source_system_id,
        v_target_system_id,
        v_channel_id,
        'active',
        '{"retries":3}'::jsonb,
        timezone('utc', now()) - interval '45 seconds'
      )
      returning id into v_connection_active_id;
    end if;

    select c.id
      into v_connection_error_id
    from public.connections c
    where c.organization_id = org.id
      and lower(c.slug) = 'demo-claims-feed'
    limit 1;

    if v_connection_error_id is null then
      insert into public.connections (
        organization_id,
        name,
        slug,
        source_system_id,
        target_system_id,
        channel_id,
        status,
        config,
        last_error_at
      )
      values (
        org.id,
        'Claims Clearing Feed',
        'demo-claims-feed',
        v_source_system_id,
        v_target_system_id,
        v_channel_id,
        'error',
        '{"retries":5}'::jsonb,
        timezone('utc', now()) - interval '2 minutes'
      )
      returning id into v_connection_error_id;
    end if;

    select m.id
      into v_message_1_id
    from public.messages m
    where m.organization_id = org.id
      and m.correlation_id = 'demo-correlation-1'
    limit 1;

    if v_message_1_id is null then
      insert into public.messages (
        organization_id,
        connection_id,
        channel_id,
        source_system_id,
        target_system_id,
        direction,
        message_type,
        content_type,
        external_id,
        correlation_id,
        raw_payload,
        payload,
        status,
        received_at
      )
      values (
        org.id,
        v_connection_active_id,
        v_channel_id,
        v_source_system_id,
        v_target_system_id,
        'inbound',
        'ADT_A01',
        'application/json',
        'ext-demo-001',
        'demo-correlation-1',
        '{"patient":"12345","event":"admit"}',
        '{"patient":"12345","event":"admit"}'::jsonb,
        'delivered',
        timezone('utc', now()) - interval '12 minutes'
      )
      returning id into v_message_1_id;
    end if;

    select m.id
      into v_message_2_id
    from public.messages m
    where m.organization_id = org.id
      and m.correlation_id = 'demo-correlation-2'
    limit 1;

    if v_message_2_id is null then
      insert into public.messages (
        organization_id,
        connection_id,
        channel_id,
        source_system_id,
        target_system_id,
        direction,
        message_type,
        content_type,
        external_id,
        correlation_id,
        raw_payload,
        payload,
        status,
        received_at,
        failed_at
      )
      values (
        org.id,
        v_connection_error_id,
        v_channel_id,
        v_source_system_id,
        v_target_system_id,
        'outbound',
        'X12_837',
        'application/json',
        'ext-demo-002',
        'demo-correlation-2',
        '{"claim":"A-1002","event":"submit"}',
        '{"claim":"A-1002","event":"submit"}'::jsonb,
        'failed',
        timezone('utc', now()) - interval '5 minutes',
        timezone('utc', now()) - interval '4 minutes'
      )
      returning id into v_message_2_id;
    end if;

    if not exists (
      select 1
      from public.message_logs ml
      where ml.organization_id = org.id
        and ml.message_id = v_message_2_id
        and ml.level = 'error'
    ) then
      insert into public.message_logs (
        organization_id,
        message_id,
        connection_id,
        level,
        event,
        details,
        metadata
      )
      values (
        org.id,
        v_message_2_id,
        v_connection_error_id,
        'error',
        'CLAIM_VALIDATION_FAILED',
        'Claim payload rejected by upstream schema validation.',
        '{"code":"VAL_837_12","retryable":true}'::jsonb
      );
    end if;

    if not exists (
      select 1
      from public.message_logs ml
      where ml.organization_id = org.id
        and ml.message_id = v_message_1_id
        and ml.level = 'info'
    ) then
      insert into public.message_logs (
        organization_id,
        message_id,
        connection_id,
        level,
        event,
        details,
        metadata
      )
      values (
        org.id,
        v_message_1_id,
        v_connection_active_id,
        'info',
        'DELIVERY_CONFIRMED',
        'Message delivered to downstream system.',
        '{"latency_ms":84}'::jsonb
      );
    end if;
  end loop;
end;
$$;
