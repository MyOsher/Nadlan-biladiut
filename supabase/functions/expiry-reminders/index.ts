// Daily exclusivity-expiry reminder emails.
// Invoked by pg_cron (see migration 0003). Sends one digest email to the agent
// for any active property whose exclusivity_end is exactly N days away, where N
// is configured in app_settings.reminder_days.
//
// Required secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   - API key from https://resend.com (free tier is enough)
//   REMINDER_FROM    - optional, defaults to 'onboarding@resend.dev'
//   CRON_SECRET      - optional shared secret; if set, callers must send it as
//                      the 'x-cron-secret' header.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DEAL_LABEL: Record<string, string> = { sale: "מכירה", rent: "השכרה" };

Deno.serve(async (req) => {
  // Optional shared-secret auth (function is deployed without JWT verification).
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") !== cronSecret) {
    return new Response("unauthorized", { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: settings } = await supabase
    .from("app_settings").select("*").eq("id", 1).single();

  const to = settings?.agent_email as string | undefined;
  const reminderDays: number[] = settings?.reminder_days ?? [14, 7, 3, 1];

  // Build the set of target dates (today + each reminder window).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const targets = new Map<string, number>();
  for (const n of reminderDays) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + n);
    targets.set(d.toISOString().slice(0, 10), n);
  }

  const { data: props } = await supabase
    .from("properties")
    .select("id, property_address, city, deal_type, owner_name, asking_price, exclusivity_end")
    .eq("status", "active")
    .in("exclusivity_end", [...targets.keys()]);

  const matches = props ?? [];
  if (matches.length === 0) {
    return json({ ok: true, sent: 0, reason: "no properties expiring on target dates" });
  }
  if (!to) {
    return json({ ok: false, sent: 0, reason: "no agent_email configured in settings", matches: matches.length });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    return json({ ok: false, sent: 0, reason: "RESEND_API_KEY not set", matches: matches.length });
  }
  const from = Deno.env.get("REMINDER_FROM") ?? "onboarding@resend.dev";

  const rows = matches
    .sort((a, b) => String(a.exclusivity_end).localeCompare(String(b.exclusivity_end)))
    .map((p) => {
      const days = targets.get(String(p.exclusivity_end)) ?? 0;
      const addr = [p.property_address, p.city].filter(Boolean).join(", ") || "נכס";
      const price = p.asking_price
        ? new Intl.NumberFormat("he-IL").format(Number(p.asking_price)) + " ₪"
        : "—";
      return `<tr>
        <td style="padding:8px;border:1px solid #e2e8f0">${addr}</td>
        <td style="padding:8px;border:1px solid #e2e8f0">${DEAL_LABEL[p.deal_type] ?? p.deal_type}</td>
        <td style="padding:8px;border:1px solid #e2e8f0">${p.owner_name ?? "—"}</td>
        <td style="padding:8px;border:1px solid #e2e8f0">${price}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;color:#b45309">עוד ${days} ימים</td>
      </tr>`;
    })
    .join("");

  const html = `<div dir="rtl" style="font-family:Arial,sans-serif;color:#0f172a">
    <h2>תזכורת בלעדיות מסתיימת</h2>
    <p>לנכסים הבאים תקופת הבלעדיות עומדת להסתיים:</p>
    <table style="border-collapse:collapse;width:100%">
      <thead><tr style="background:#f1f5f9">
        <th style="padding:8px;border:1px solid #e2e8f0">כתובת</th>
        <th style="padding:8px;border:1px solid #e2e8f0">עסקה</th>
        <th style="padding:8px;border:1px solid #e2e8f0">בעלים</th>
        <th style="padding:8px;border:1px solid #e2e8f0">מחיר</th>
        <th style="padding:8px;border:1px solid #e2e8f0">נותרו</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject: `⏰ ${matches.length} נכסים — בלעדיות מסתיימת בקרוב`,
      html,
    }),
  });
  const body = await res.text();
  return json({ ok: res.ok, sent: res.ok ? matches.length : 0, resend_status: res.status, body });
});

function json(obj: unknown) {
  return new Response(JSON.stringify(obj), { headers: { "Content-Type": "application/json" } });
}
