// Daily digest: Telegram summary + expiry alerts (and optional email).
// Invoked by pg_cron (migration 0003). Sends:
//   - Telegram: a daily summary of all active properties with days-to-expiry,
//     highlighting those ending within the largest reminder window.
//   - Email (optional): a digest of properties expiring exactly on a reminder day,
//     when RESEND_API_KEY + agent_email are configured.
//
// Secrets/config:
//   app_secrets.telegram_bot_token   (required for Telegram)
//   app_settings.telegram_chat_id    (set automatically when you /start the bot)
//   app_settings.reminder_days       (e.g. {14,7,3,1})
//   RESEND_API_KEY env + app_settings.agent_email (optional, for email)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEAL: Record<string, string> = { sale: "מכירה", rent: "השכרה" };

Deno.serve(async () => {
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: settings } = await db.from("app_settings").select("*").eq("id", 1).single();
  const reminderDays: number[] = (settings?.reminder_days ?? [14, 7, 3, 1]).slice().sort((a: number, b: number) => a - b);
  const maxWindow = Math.max(...reminderDays, 14);

  const { data: active } = await db
    .from("properties")
    .select("id, property_address, city, deal_type, owner_name, asking_price, exclusivity_end")
    .eq("status", "active")
    .order("exclusivity_end", { ascending: true, nullsFirst: false });

  const props = active ?? [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const daysTo = (d: string | null) => {
    if (!d) return null;
    const t = new Date(d);
    t.setUTCHours(0, 0, 0, 0);
    return Math.round((t.getTime() - today.getTime()) / 86_400_000);
  };

  const results: Record<string, unknown> = {};

  // ---- Telegram daily summary ----
  const botToken = await getSecret(db, "telegram_bot_token");
  const chatId = settings?.telegram_chat_id;
  if (botToken && chatId && settings?.telegram_enabled !== false && props.length) {
    const lines = props.map((p) => {
      const dleft = daysTo(p.exclusivity_end);
      const dot = dleft === null ? "⚪" : dleft < 0 ? "🔴" : dleft <= 7 ? "🟠" : dleft <= 14 ? "🟡" : "🟢";
      const left = dleft === null ? "ללא תאריך" : dleft < 0 ? `פג לפני ${-dleft} ימים` : `עוד ${dleft} ימים`;
      const addr = [p.property_address, p.city].filter(Boolean).join(", ") || "נכס";
      return `${dot} <b>${addr}</b> — ${DEAL[p.deal_type] ?? p.deal_type} · ${left}`;
    });
    const expiringCount = props.filter((p) => {
      const d = daysTo(p.exclusivity_end);
      return d !== null && d <= maxWindow;
    }).length;
    const header =
      `📊 <b>סיכום יומי — ${props.length} נכסים פעילים</b>\n` +
      (expiringCount ? `⏰ ${expiringCount} בבלעדיות שמסתיימת בקרוב\n` : "") +
      `\n`;
    const text = header + lines.join("\n");
    const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
    results.telegram = { ok: r.ok, status: r.status };
  } else {
    results.telegram = { skipped: true, reason: !botToken ? "no bot token" : !chatId ? "no chat id (send /start)" : "no active properties or disabled" };
  }

  // ---- Email (optional) for properties expiring exactly on a reminder day ----
  const to = settings?.agent_email as string | undefined;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (to && resendKey) {
    const targets = new Set(reminderDays);
    const due = props.filter((p) => {
      const d = daysTo(p.exclusivity_end);
      return d !== null && targets.has(d);
    });
    if (due.length) {
      const rows = due.map((p) => {
        const d = daysTo(p.exclusivity_end);
        const addr = [p.property_address, p.city].filter(Boolean).join(", ") || "נכס";
        const price = p.asking_price ? new Intl.NumberFormat("he-IL").format(Number(p.asking_price)) + " ₪" : "—";
        return `<tr><td style="padding:8px;border:1px solid #e2e8f0">${addr}</td><td style="padding:8px;border:1px solid #e2e8f0">${DEAL[p.deal_type] ?? p.deal_type}</td><td style="padding:8px;border:1px solid #e2e8f0">${p.owner_name ?? "—"}</td><td style="padding:8px;border:1px solid #e2e8f0">${price}</td><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;color:#b45309">עוד ${d} ימים</td></tr>`;
      }).join("");
      const html = `<div dir="rtl" style="font-family:Arial,sans-serif"><h2>תזכורת בלעדיות מסתיימת</h2><table style="border-collapse:collapse;width:100%"><thead><tr style="background:#f1f5f9"><th style="padding:8px;border:1px solid #e2e8f0">כתובת</th><th style="padding:8px;border:1px solid #e2e8f0">עסקה</th><th style="padding:8px;border:1px solid #e2e8f0">בעלים</th><th style="padding:8px;border:1px solid #e2e8f0">מחיר</th><th style="padding:8px;border:1px solid #e2e8f0">נותרו</th></tr></thead><tbody>${rows}</tbody></table></div>`;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: Deno.env.get("REMINDER_FROM") ?? "onboarding@resend.dev", to, subject: `⏰ ${due.length} נכסים — בלעדיות מסתיימת בקרוב`, html }),
      });
      results.email = { ok: r.ok, sent: due.length };
    } else {
      results.email = { skipped: true, reason: "nothing due today" };
    }
  } else {
    results.email = { skipped: true, reason: "email not configured" };
  }

  return new Response(JSON.stringify({ ok: true, ...results }), { headers: { "Content-Type": "application/json" } });
});

async function getSecret(db: ReturnType<typeof createClient>, key: string): Promise<string | null> {
  const { data } = await db.from("app_secrets").select("value").eq("key", key).maybeSingle();
  return (data as { value?: string } | null)?.value ?? null;
}
