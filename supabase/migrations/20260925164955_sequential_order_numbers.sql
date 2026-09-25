-- Applied to the straus-tailor Supabase project on 2026-09-25 (migration "sequential_order_numbers").
-- Sequential order numbers starting at #10001. Older orders used random 5-digit
-- numbers, so any number already taken is skipped. nextval() never hands the same
-- value to two callers, so orders created at the same moment can't collide.
create sequence if not exists public.order_number_seq start with 10001 minvalue 10001;

create or replace function public.next_order_number()
returns integer
language plpgsql
set search_path = ''
as $$
declare
  n integer;
begin
  loop
    n := nextval('public.order_number_seq');
    exit when not exists (select 1 from public.orders o where o.order_number = n);
  end loop;
  return n;
end;
$$;

-- Server-only, like the rest of the schema
revoke all on function public.next_order_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to service_role;
revoke all on sequence public.order_number_seq from public, anon, authenticated;
grant usage, select, update on sequence public.order_number_seq to service_role;
