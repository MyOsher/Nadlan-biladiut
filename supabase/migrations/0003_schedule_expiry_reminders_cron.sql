-- 0003_schedule_expiry_reminders_cron.sql
-- Daily background job that triggers the `expiry-reminders` edge function.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  perform cron.unschedule('daily-expiry-reminders');
exception when others then
  null;
end $$;

-- Every day at 06:00 UTC (~09:00 Israel).
select cron.schedule(
  'daily-expiry-reminders',
  '0 6 * * *',
  $$
  select net.http_post(
    url := 'https://kovjbfdgllnprryqvgon.supabase.co/functions/v1/expiry-reminders',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);
