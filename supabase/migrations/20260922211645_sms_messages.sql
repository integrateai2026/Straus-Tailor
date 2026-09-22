-- Applied to the straus-tailor Supabase project on 2026-09-22 (migration "sms_messages").
-- Kept here as the record of the schema the texting feature depends on.

-- Customer text conversations: texts customers send the shop's Twilio number
-- (via the /api/sms/incoming webhook) and texts the shop sends them.
create table public.sms_messages (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,                -- customer's number, digits only (US numbers without the leading 1)
  order_id    text references public.orders (id) on update cascade on delete set null,
  direction   text not null check (direction in ('inbound', 'outbound')),
  body        text not null default '',
  media       jsonb,                        -- MMS attachments: [{ url, contentType }] — Twilio URLs, need credentials
  twilio_sid  text unique,                  -- Twilio message SID; makes webhook retries harmless
  read_at     timestamptz,                  -- inbound only: when staff opened the conversation
  created_at  timestamptz not null default now()
);

create index sms_messages_phone_created_idx on public.sms_messages (phone, created_at desc);
create index sms_messages_order_idx on public.sms_messages (order_id);
create index sms_messages_unread_idx on public.sms_messages (phone) where direction = 'inbound' and read_at is null;

-- Server-only table: the app uses the service role key; no browser/anon access
alter table public.sms_messages enable row level security;
revoke all on public.sms_messages from anon, authenticated;

-- Match texts to orders by phone digits, however the number was typed on the order
alter table public.orders
  add column phone_digits text generated always as (right(regexp_replace(phone, '\D', '', 'g'), 10)) stored;
create index orders_phone_digits_idx on public.orders (phone_digits);

-- Conversations for the staff Messages panel: every number that has texted us,
-- newest activity first, with unread count and the order it's linked to
create or replace function public.sms_threads(max_threads integer default 50)
returns table (
  phone          text,
  unread         integer,
  last_body      text,
  last_direction text,
  last_at        timestamptz,
  last_has_media boolean,
  order_id       text,
  customer_name  text
)
language sql
stable
set search_path = ''
as $$
  with convo as (
    select m.phone as convo_phone,
           (count(*) filter (where m.direction = 'inbound' and m.read_at is null))::integer as unread_count
    from public.sms_messages m
    group by m.phone
    having bool_or(m.direction = 'inbound')
  ),
  latest as (
    select distinct on (m.phone)
           m.phone as msg_phone, m.body as msg_body, m.direction as msg_direction,
           m.created_at as msg_at, (m.media is not null) as msg_has_media
    from public.sms_messages m
    where m.phone in (select c.convo_phone from convo c)
    order by m.phone, m.created_at desc
  ),
  page as (
    select l.*, c.unread_count
    from latest l
    join convo c on c.convo_phone = l.msg_phone
    order by l.msg_at desc
    limit max_threads
  ),
  linked as (
    select p.*,
           coalesce(
             -- the order their texts were last matched to…
             (select m.order_id from public.sms_messages m
               where m.phone = p.msg_phone and m.order_id is not null
               order by m.created_at desc limit 1),
             -- …or their newest order, if none were matched
             (select o.id from public.orders o
               where o.phone_digits = p.msg_phone
               order by o.created_at desc limit 1)
           ) as linked_order_id
    from page p
  )
  select k.msg_phone, k.unread_count, k.msg_body, k.msg_direction, k.msg_at,
         k.msg_has_media, k.linked_order_id, o.customer_name
  from linked k
  left join public.orders o on o.id = k.linked_order_id
  order by k.msg_at desc;
$$;

revoke execute on function public.sms_threads(integer) from public, anon, authenticated;
grant execute on function public.sms_threads(integer) to service_role;
