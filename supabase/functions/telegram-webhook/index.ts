// Telegram webhook for the property manager.
//
// Capabilities:
//   GET  ?setup=1            -> registers this URL as the bot webhook (with a secret token)
//   POST (Telegram update)   -> handles:
//       /start, /id          -> remembers your chat id (so the bot can DM you)
//       photo / pdf document  -> saves the signed form, runs AI extraction (if an
//                                Anthropic key is configured), creates a DRAFT property,
//                                and replies with a summary.
//
// Secrets live in the private `app_secrets` table (service-role only):
//   telegram_bot_token, telegram_webhook_secret, [anthropic_api_key], [app_base_url]
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const FUNCTION_URL =
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/telegram-webhook`;

const admin = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

async function getSecret(db: ReturnType<typeof admin>, key: string): Promise<string | null> {
  const { data } = await db.from("app_secrets").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

async function tg(token: string, method: string, payload: unknown) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function send(token: string, chatId: number | string, text: string) {
  await tg(token, "sendMessage", { chat_id: chatId, text, parse_mode: "HTML" });
}

Deno.serve(async (req) => {
  const db = admin();
  const token = await getSecret(db, "telegram_bot_token");
  const webhookSecret = await getSecret(db, "telegram_webhook_secret");
  if (!token) return json({ ok: false, error: "telegram_bot_token not configured" }, 500);

  const url = new URL(req.url);

  // One-time setup: register the webhook with Telegram.
  if (req.method === "GET" && url.searchParams.has("setup")) {
    const result = await tg(token, "setWebhook", {
      url: FUNCTION_URL,
      secret_token: webhookSecret,
      allowed_updates: ["message"],
      drop_pending_updates: true,
    });
    return json({ setup: true, telegram: result, webhook_url: FUNCTION_URL });
  }

  if (req.method !== "POST") return json({ ok: true, hint: "POST webhook endpoint. Use ?setup=1 once." });

  // Verify the request really came from Telegram.
  if (webhookSecret && req.headers.get("x-telegram-bot-api-secret-token") !== webhookSecret) {
    return json({ ok: false, error: "bad secret" }, 401);
  }

  let update: any;
  try {
    update = await req.json();
  } catch {
    return json({ ok: true });
  }

  const msg = update.message ?? update.edited_message;
  if (!msg) return json({ ok: true });
  const chatId = msg.chat.id;

  try {
    const text: string = (msg.text ?? msg.caption ?? "").trim();

    // Remember the chat id on /start or /id.
    if (text === "/start" || text === "/id") {
      await db.from("app_settings").update({ telegram_chat_id: String(chatId) }).eq("id", 1);
      await send(
        token,
        chatId,
        "✅ <b>חובר בהצלחה!</b>\nמעכשיו תקבל כאן תזכורות וסיכום יומי.\n\n📸 שלח לי <b>צילום או PDF של טופס בלעדיות חתום</b> ואני אפתח עבורו נכס חדש (טיוטה) ואמלא את הפרטים אוטומטית.",
      );
      return json({ ok: true });
    }

    // Find an attached photo or PDF/image document.
    let fileId: string | null = null;
    let mime = "image/jpeg";
    if (msg.photo?.length) {
      fileId = msg.photo[msg.photo.length - 1].file_id; // largest size
    } else if (msg.document && /image\/|pdf/.test(msg.document.mime_type ?? "")) {
      fileId = msg.document.file_id;
      mime = msg.document.mime_type;
    }

    if (!fileId) {
      await send(
        token,
        chatId,
        "שלח/י לי <b>צילום או PDF של טופס בלעדיות חתום</b> ואפתח עבורו נכס חדש.\nפקודות: /start לחיבור.",
      );
      return json({ ok: true });
    }

    await send(token, chatId, "📥 קיבלתי את הטופס, מעבד…");

    // Download the file from Telegram.
    const fileInfo = await tg(token, "getFile", { file_id: fileId });
    const filePath = fileInfo?.result?.file_path;
    if (!filePath) throw new Error("getFile failed");
    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`);
    const bytes = new Uint8Array(await fileRes.arrayBuffer());
    const ext = filePath.split(".").pop() ?? "jpg";

    // Store the signed form.
    const storagePath = `telegram/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage
      .from("signed-forms")
      .upload(storagePath, bytes, { contentType: mime, upsert: false });
    if (upErr) throw upErr;
    const signedFormUrl = db.storage.from("signed-forms").getPublicUrl(storagePath).data.publicUrl;

    // AI extraction (optional — only if an Anthropic key is present).
    let extracted: any = null;
    const anthropicKey = await getSecret(db, "anthropic_api_key");
    if (anthropicKey && mime.startsWith("image/")) {
      extracted = await extractWithClaude(anthropicKey, bytes, mime).catch(() => null);
    }

    // Create the draft property.
    const ins = {
      status: "draft",
      deal_type: extracted?.deal_type === "rent" ? "rent" : "sale",
      property_type: extracted?.property_type ?? null,
      rooms: numOrNull(extracted?.rooms),
      property_address: extracted?.property_address ?? null,
      city: extracted?.city ?? null,
      block: extracted?.block ?? null,
      parcel: extracted?.parcel ?? null,
      sub_parcel: extracted?.sub_parcel ?? null,
      asking_price: numOrNull(extracted?.asking_price),
      owner_name: extracted?.owner_name ?? null,
      exclusivity_start: dateOrNull(extracted?.exclusivity_start),
      exclusivity_end: dateOrNull(extracted?.exclusivity_end),
      fee_sale_percent: numOrNull(extracted?.fee_sale_percent),
      form_number: extracted?.form_number ?? null,
      agent_name: extracted?.agent_name ?? null,
      agent_id_number: extracted?.agent_id_number ?? null,
      agreement_date: dateOrNull(extracted?.agreement_date),
      signed_form_url: signedFormUrl,
    };
    const { data: prop, error: insErr } = await db
      .from("properties").insert(ins).select("id").single();
    if (insErr) throw insErr;

    // Owners, if extracted.
    const owners = Array.isArray(extracted?.owners) ? extracted.owners : [];
    if (owners.length) {
      await db.from("property_owners").insert(
        owners.map((o: any, i: number) => ({
          property_id: prop.id,
          full_name: o?.full_name ?? null,
          id_number: o?.id_number ?? null,
          phone: o?.phone ?? null,
          address: o?.address ?? null,
          sort_order: i,
        })),
      );
    }

    const base = await getSecret(db, "app_base_url");
    const link = base ? `\n🔗 ${base.replace(/\/$/, "")}/properties/${prop.id}` : "";
    const summary = extracted
      ? `📍 ${ins.property_address ?? "—"}${ins.city ? ", " + ins.city : ""}\n🏷️ ${
        ins.deal_type === "rent" ? "השכרה" : "מכירה"
      } · ${ins.property_type ?? "—"}\n💰 ${ins.asking_price ? Number(ins.asking_price).toLocaleString("he-IL") + " ₪" : "—"}\n👤 ${ins.owner_name ?? "—"}\n📅 בלעדיות עד: ${ins.exclusivity_end ?? "—"}`
      : "הטופס נשמר. (קריאת AI אינה פעילה — לא הוגדר מפתח Anthropic.)";

    await send(
      token,
      chatId,
      `✅ <b>נוצרה טיוטת נכס</b>\n${summary}${link}\n\nהיכנס/י לאפליקציה כדי לבדוק ולהשלים פרטים.`,
    );
    return json({ ok: true, property_id: prop.id, extracted: !!extracted });
  } catch (err) {
    await send(token, chatId, `❌ אירעה שגיאה בעיבוד: ${err instanceof Error ? err.message : err}`);
    return json({ ok: false, error: String(err) });
  }
});

async function extractWithClaude(apiKey: string, bytes: Uint8Array, mime: string) {
  const b64 = base64(bytes);
  const prompt =
    `This is a photo of an Israeli real-estate exclusive brokerage agreement ("הזמנת שירותי תיווך בבלעדיות"), often handwritten in Hebrew. ` +
    `Extract the fields and respond with ONLY a JSON object (no markdown) using these keys: ` +
    `deal_type ("sale" or "rent"), property_type, rooms (number), property_address, city, block, parcel, sub_parcel, ` +
    `asking_price (number, no separators), owner_name, ` +
    `owners (array of {full_name, id_number, phone, address}), ` +
    `exclusivity_start (YYYY-MM-DD), exclusivity_end (YYYY-MM-DD), fee_sale_percent (number), ` +
    `form_number, agent_name, agent_id_number, agreement_date (YYYY-MM-DD). ` +
    `Use null for anything you cannot read. Dates may appear as DD/MM/YY — interpret the year as 20YY.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mime, data: b64 } },
          { type: "text", text: prompt },
        ],
      }],
    }),
  });
  const data = await res.json();
  const txt: string = data?.content?.[0]?.text ?? "";
  const jsonStr = txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1);
  return JSON.parse(jsonStr);
}

function base64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? null : n;
}
function dateOrNull(v: unknown): string | null {
  if (!v || typeof v !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}
function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
