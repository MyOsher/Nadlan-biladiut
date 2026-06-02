import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anonKey) {
  // Helpful message during local setup
  // eslint-disable-next-line no-console
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local."
  );
}

// Note: the client is intentionally untyped at the schema level. Row shapes are
// enforced where it matters via the explicit interfaces in ./types and the typed
// React state in each component. This avoids supabase-js generic inference
// resolving insert/update payloads to `never` with a hand-written Database type.
export const supabase = createClient(url, anonKey);

export const MEDIA_BUCKET = "property-media";
export const FORMS_BUCKET = "signed-forms";
