-- Applied to the straus-tailor Supabase project on 2026-10-02 (migration "order_history").
-- Dated record of pickups and undone pickups, shown in each order's History list:
-- [{ "event": "picked_up" | "pickup_undone", "at": "<ISO time>" }]
alter table public.orders add column if not exists history jsonb;
