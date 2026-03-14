create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
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
set search_path = public
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
