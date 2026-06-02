// Public, read-only listings API for the external marketing website.
//
// Why an Edge Function (and not the anon key + REST)?
//   The base `properties` table still has "open access" RLS, so the anon key can
//   read EVERYTHING — including ת"ז, חתימות, עמלות, גוש/חלקה. We must never embed
//   that key in a public website. This function uses the service role internally
//   and returns ONLY marketing-safe fields for properties where is_published=true.
//
// Routes (all GET, CORS-enabled — call from any site with plain fetch):
//   GET /public-listings              -> array of published listings (summary + cover)
//   GET /public-listings?slug=<slug>  -> one listing (full marketing fields + media[])
//
// Deploy with verify_jwt=false so the website can call it without auth.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Marketing-safe columns only. Never add owner_name, id_number, signatures,
// fees, block/parcel, notes or signed-form URLs here.
const LISTING_FIELDS =
  "public_slug, deal_type, status, property_type, rooms, size_sqm, floor, " +
  "property_address, city, asking_price, public_description, cover_image_url, created_at";

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("PUBLIC_SITE_ORIGIN") ?? "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "GET") return json({ error: "method not allowed" }, 405);

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  // ---- Single listing (with media gallery) ----
  if (slug) {
    const { data: listing, error } = await db
      .from("properties")
      .select(LISTING_FIELDS)
      .eq("public_slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    if (!listing) return json({ error: "not found" }, 404);

    // We have the slug but need the id to fetch media; look it up privately.
    const { data: row } = await db
      .from("properties")
      .select("id")
      .eq("public_slug", slug)
      .maybeSingle();

    const { data: media } = await db
      .from("property_media")
      .select("type, url, caption, sort_order")
      .eq("property_id", row?.id ?? "")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    return json({ ...listing, media: media ?? [] });
  }

  // ---- List of all published listings (summary) ----
  const { data, error } = await db
    .from("properties")
    .select(LISTING_FIELDS)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) return json({ error: error.message }, 500);

  return json({ listings: data ?? [] });
});
