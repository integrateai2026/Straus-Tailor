-- Applied to the straus-tailor Supabase project on 2026-10-02 (migration "order_tailors").
-- Optional: which tailors worked on an order (picked on the order details page)
alter table public.orders add column if not exists tailors text[];
