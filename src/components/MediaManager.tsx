"use client";

import { useEffect, useRef, useState } from "react";
import { supabase, MEDIA_BUCKET } from "@/lib/supabase";
import type { PropertyMedia } from "@/lib/types";

interface Props {
  propertyId: string;
  coverUrl: string | null;
  onCoverChange: (url: string) => void;
}

export default function MediaManager({ propertyId, coverUrl, onCoverChange }: Props) {
  const [media, setMedia] = useState<PropertyMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data, error } = await supabase
      .from("property_media")
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setMedia(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const type = file.type.startsWith("video") ? "video" : "image";
        const path = `${propertyId}/${crypto.randomUUID()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) throw upErr;
        const url = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
        const { error: insErr } = await supabase.from("property_media").insert({
          property_id: propertyId,
          type,
          storage_path: path,
          url,
          sort_order: media.length,
        });
        if (insErr) throw insErr;
        // First uploaded image becomes the cover if none set.
        if (type === "image" && !coverUrl) onCoverChange(url);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בהעלאה");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(item: PropertyMedia) {
    if (!confirm("למחוק את הקובץ?")) return;
    await supabase.storage.from(MEDIA_BUCKET).remove([item.storage_path]);
    await supabase.from("property_media").delete().eq("id", item.id);
    await load();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "מעלה…" : "+ העלאת תמונות / סרטונים"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="text-sm text-slate-500">{media.length} קבצים</span>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">טוען…</p>
      ) : media.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-400">
          אין עדיין תמונות או סרטונים לנכס זה
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {m.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url ?? ""} alt={m.caption ?? ""} className="h-36 w-full object-cover" />
              ) : (
                <video src={m.url ?? ""} controls className="h-36 w-full object-cover" />
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 px-2 py-1 opacity-0 transition group-hover:opacity-100">
                {m.type === "image" && (
                  <button
                    type="button"
                    onClick={() => m.url && onCoverChange(m.url)}
                    className="text-xs font-semibold text-white hover:underline"
                  >
                    {coverUrl === m.url ? "✓ תמונה ראשית" : "הגדר כראשית"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(m)}
                  className="text-xs font-semibold text-red-300 hover:underline"
                >
                  מחיקה
                </button>
              </div>
              {coverUrl === m.url && (
                <span className="badge absolute right-2 top-2 bg-brand-600 text-white">ראשית</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
