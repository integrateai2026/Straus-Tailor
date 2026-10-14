-- Applied to the straus-tailor Supabase project on 2026-10-14 (migration "sms_delivery_status").
-- What Twilio says happened to each text we sent: delivered, or not delivered and why
alter table public.sms_messages add column if not exists status text;
alter table public.sms_messages add column if not exists error_code text;

-- Record one of Twilio's delivery updates for a text we sent. Updates can arrive out of
-- order, so a status never moves backwards (a late "sent" can't replace "delivered").
-- Returns 'updated', 'kept' (not newer than what's saved) or 'missing' (no such text saved yet).
create or replace function public.sms_record_status(p_sid text, p_status text, p_error_code text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  current_status text;
  rank_of constant jsonb := '{"accepted":1,"scheduled":1,"queued":1,"sending":2,"sent":3,"delivered":4,"undelivered":4,"failed":4,"canceled":4,"read":5}';
begin
  select status into current_status from public.sms_messages where twilio_sid = p_sid for update;
  if not found then return 'missing'; end if;
  if coalesce((rank_of ->> p_status)::int, 0) <= coalesce((rank_of ->> current_status)::int, 0) then
    return 'kept';
  end if;
  update public.sms_messages set status = p_status, error_code = p_error_code where twilio_sid = p_sid;
  return 'updated';
end;
$$;

revoke execute on function public.sms_record_status(text, text, text) from public, anon, authenticated;
grant execute on function public.sms_record_status(text, text, text) to service_role;
