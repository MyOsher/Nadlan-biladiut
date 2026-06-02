import { createClient } from "@supabase/supabase-js";

// Defaults point at the project's Supabase instance ("Haneches db"). These are
// the public URL and publishable key (safe to expose — access is gated by RLS).
// Override them with environment variables to point at a different project.
const DEFAULT_URL = "https://kovjbfdgllnprryqvgon.supabase.co";
const DEFAULT_ANON_KEY = "sb_publishable_LLAzSOVP1II9XMnYNW8ueA_dszRNg_w";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Note: the client is intentionally untyped at the schema level. Row shapes are
// enforced where it matters via the explicit interfaces in ./types and the typed
// React state in each component. This avoids supabase-js generic inference
// resolving insert/update payloads to `never` with a hand-written Database type.
export const supabase = createClient(url, anonKey);

export const SUPABASE_URL = url;
export const MEDIA_BUCKET = "property-media";
export const FORMS_BUCKET = "signed-forms";

/** Public, read-only listings API consumed by the external marketing website. */
export const PUBLIC_LISTINGS_API = `${url}/functions/v1/public-listings`;
