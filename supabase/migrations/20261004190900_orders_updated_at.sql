-- Applied to the straus-tailor Supabase project on 2026-10-04 (migration "orders_updated_at").
-- When each order last changed, so the staff dashboard can download only what changed
alter table public.orders add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_orders_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_orders_updated_at();

create index if not exists orders_updated_at_idx on public.orders (updated_at);
