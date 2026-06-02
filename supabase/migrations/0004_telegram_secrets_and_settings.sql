-- 0004_telegram_secrets_and_settings.sql
-- Private secrets store (service-role only) + Telegram settings.

-- RLS enabled with NO policies => the browser publishable key cannot read this.
-- Edge functions use the service-role key, which bypasses RLS.
create table if not exists public.app_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);
alter table public.app_secrets enable row level security;

alter table public.app_settings add column if not exists telegram_chat_id text;
alter table public.app_settings add column if not exists telegram_enabled boolean default true;

-- Secrets are inserted out-of-band (not committed). Expected keys:
--   telegram_bot_token        (required)  - from @BotFather
--   telegram_webhook_secret   (required)  - random string validating Telegram calls
--   anthropic_api_key         (optional)  - enables AI form extraction
--   app_base_url              (optional)  - e.g. https://your-app.vercel.app (for links)
--
-- Example (run via SQL editor / MCP, never commit real values):
--   insert into public.app_secrets(key,value) values
--     ('telegram_bot_token','123:ABC'),
--     ('telegram_webhook_secret', replace(gen_random_uuid()::text,'-',''))
--   on conflict (key) do update set value = excluded.value, updated_at = now();
