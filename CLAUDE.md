# CLAUDE.md — Nadlan Biladiut (נדל״ן בלעדיות)

Context for future Claude sessions working on this repo.

## What this is
A Hebrew (RTL) real-estate **exclusivity manager** for a single agent: track properties
under exclusive brokerage agreements ("בלעדיות"), their owners, fees, and when each
exclusivity period ends. Includes a Telegram bot that ingests signed agreement forms and
sends a daily summary + expiry reminders.

## Stack
- **Next.js (App Router) + TypeScript + Tailwind** — `src/`
- **Supabase** — Postgres, Storage, Edge Functions, `pg_cron` + `pg_net`
  - Project: "Haneches db", ref `kovjbfdgllnprryqvgon`
- **Deploy**: Vercel (frontend). Edge functions deploy to Supabase.

## Key paths
- `src/app/` — pages: properties list, `properties/new`, `properties/[id]`, `properties/[id]/print`, `settings`
- `src/lib/types.ts` — DB row types (keep in sync with migrations)
- `supabase/migrations/` — schema (0001 init, 0002 policies+buckets, 0003 cron, 0004 telegram/secrets)
- `supabase/functions/telegram-webhook/` — Telegram bot
- `supabase/functions/expiry-reminders/` — daily digest (cron-invoked)

## Data model (core)
- `properties` — main record. `status` is `draft | active | …`. Bot-created forms land as `draft`.
  Holds deal_type (sale/rent), address/city, block/parcel, asking_price, owner_name,
  exclusivity_start/end, fees, agent fields, `signed_form_url`.
- `property_owners` — one-to-many owners (full_name, id_number, phone, address, sort_order).
- `app_settings` (single row, id=1) — agent_email, reminder_days[], default fees,
  `telegram_chat_id`, `telegram_enabled`.
- `app_secrets` (key/value) — **private**: RLS enabled with NO policies, so the browser
  publishable key cannot read it; only edge functions (service-role) can. Keys:
  `telegram_bot_token`, `telegram_webhook_secret`, `anthropic_api_key` (optional),
  `app_base_url` (optional). NEVER commit real secret values.

## Telegram bot (@Haneches_bot)
Webhook function `telegram-webhook` (deployed `verify_jwt=false`, authenticated via Telegram
`secret_token` matched against `app_secrets.telegram_webhook_secret`):
- `GET ?setup=1` — registers the webhook with Telegram (run once).
- `/start` or `/id` — stores the sender's chat id in `app_settings.telegram_chat_id`.
- **photo or PDF** — downloads the file, uploads to the `signed-forms` Storage bucket,
  optionally runs **Claude extraction** (model `claude-sonnet-4-6`; image→`image` block,
  PDF→`document` block) when `anthropic_api_key` is set, then inserts a **draft** property
  (+ owners) and replies with a summary. Without the key/credit it still saves the file and
  creates a draft — just no auto-fill.

`expiry-reminders` (invoked daily by `pg_cron`, see migration 0003): sends a **Telegram daily
summary** of active properties with days-to-expiry, and an optional **email** digest (Resend)
for properties expiring exactly on a `reminder_days` boundary.

## Conventions
- UI is Hebrew/RTL. Keep copy in Hebrew.
- Edge functions read secrets from `app_secrets` via service-role; never hardcode.
- Deploying an edge function via MCP replaces the whole entrypoint — supply the full file.
  `pg_net` (`net.http_get/post`) can call functions/external APIs server-side (use a generous
  `timeout_milliseconds`; first call after deploy is a cold start).
- Branch for ongoing work: `claude/real-estate-property-app-BXcEn`; merge to `main` for Vercel.
