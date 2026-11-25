-- Applied to the straus-tailor Supabase project on 2026-11-25 (migration "order_received_by").
-- Optional: which staff member took the order in (customer form → Staff Details → Received by)
alter table public.orders add column if not exists received_by text;
