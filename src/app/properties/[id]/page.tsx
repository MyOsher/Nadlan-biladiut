"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, FORMS_BUCKET } from "@/lib/supabase";
import type { Property, PropertyStatus } from "@/lib/types";
import { DEAL_TYPE_LABEL, STATUS_LABEL, cn, exclusivityState, formatDate } from "@/lib/utils";
import SignaturePad from "@/components/SignaturePad";
import MediaManager from "@/components/MediaManager";
import OwnersEditor from "@/components/OwnersEditor";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [p, setP] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();
      if (error) setError(error.message);
      else setP(data);
      setLoading(false);
    })();
  }, [id]);

  function field<K extends keyof Property>(key: K, value: Property[K]) {
    setP((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!p) return;
    setSaving(true);
    setMsg(null);
    setError(null);
    const { id: _id, created_at, updated_at, ...patch } = p;
    const { error } = await supabase.from("properties").update(patch).eq("id", id);
    if (error) setError(error.message);
    else setMsg("הנכס נשמר בהצלחה");
    setSaving(false);
    setTimeout(() => setMsg(null), 2500);
  }

  async function uploadScans(files: FileList) {
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${id}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from(FORMS_BUCKET).upload(path, file);
      if (error) {
        setError(error.message);
        return;
      }
      urls.push(supabase.storage.from(FORMS_BUCKET).getPublicUrl(path).data.publicUrl);
    }
    if (!urls.length) return;
    const next = [...(p?.signed_form_urls ?? []), ...urls];
    field("signed_form_urls", next);
    field("signed_form_url", next[0]);
    await supabase
      .from("properties")
      .update({ signed_form_urls: next, signed_form_url: next[0] })
      .eq("id", id);
  }

  async function removeScan(url: string) {
    const next = (p?.signed_form_urls ?? []).filter((u) => u !== url);
    field("signed_form_urls", next);
    field("signed_form_url", next[0] ?? null);
    await supabase
      .from("properties")
      .update({ signed_form_urls: next, signed_form_url: next[0] ?? null })
      .eq("id", id);
  }

  async function removeProperty() {
    if (!confirm("למחוק את הנכס לצמיתות? פעולה זו אינה הפיכה.")) return;
    await supabase.from("properties").delete().eq("id", id);
    router.push("/");
  }

  if (loading) return <p className="py-10 text-center text-slate-500">טוען…</p>;
  if (!p) return <p className="py-10 text-center text-red-600">הנכס לא נמצא. {error}</p>;

  const ex = exclusivityState(p.exclusivity_end);
  // Prefer the multi-value column; fall back to the legacy single URL.
  const forms = p.signed_form_urls?.length ? p.signed_form_urls : p.signed_form_url ? [p.signed_form_url] : [];

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="badge bg-brand-600 text-white">{DEAL_TYPE_LABEL[p.deal_type]}</span>
              <span className={cn("badge", ex.className)}>{ex.label}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800">
              {p.property_address || "נכס ללא כתובת"}
              {p.city ? `, ${p.city}` : ""}
            </h1>
            <p className="text-sm text-slate-500">
              {[p.property_type, p.owner_name && `בעלים: ${p.owner_name}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="field-input w-auto"
              value={p.status}
              onChange={(e) => field("status", e.target.value as PropertyStatus)}
            >
              {Object.entries(STATUS_LABEL).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <Link href={`/properties/${id}/print`} className="btn btn-secondary" target="_blank">
              הדפסת הסכם
            </Link>
            <button onClick={removeProperty} className="btn btn-danger">
              מחיקה
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <InfoBox label="תחילת בלעדיות" value={formatDate(p.exclusivity_start)} />
          <InfoBox label="סיום בלעדיות" value={formatDate(p.exclusivity_end)} highlight={ex.level} />
          <InfoBox label="מחיר מבוקש" value={p.asking_price ? `₪ ${Number(p.asking_price).toLocaleString("he-IL")}` : "—"} />
        </div>
      </div>

      {error && <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Editable details */}
      <Section title="פרטי הנכס (ניתן לעריכה)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="סוג הנכס"><input className="field-input" value={p.property_type ?? ""} onChange={(e) => field("property_type", e.target.value)} /></Field>
          <Field label="מספר חדרים"><input type="number" step="0.5" className="field-input" value={p.rooms ?? ""} onChange={(e) => field("rooms", e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="שטח (מ״ר)"><input type="number" className="field-input" value={p.size_sqm ?? ""} onChange={(e) => field("size_sqm", e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="קומה"><input className="field-input" value={p.floor ?? ""} onChange={(e) => field("floor", e.target.value)} /></Field>
          <Field label="כתובת הנכס"><input className="field-input" value={p.property_address ?? ""} onChange={(e) => field("property_address", e.target.value)} /></Field>
          <Field label="עיר"><input className="field-input" value={p.city ?? ""} onChange={(e) => field("city", e.target.value)} /></Field>
          <Field label="גוש"><input className="field-input" value={p.block ?? ""} onChange={(e) => field("block", e.target.value)} /></Field>
          <Field label="חלקה"><input className="field-input" value={p.parcel ?? ""} onChange={(e) => field("parcel", e.target.value)} /></Field>
          <Field label="תת חלקה"><input className="field-input" value={p.sub_parcel ?? ""} onChange={(e) => field("sub_parcel", e.target.value)} /></Field>
          <Field label="מחיר מבוקש (₪)"><input type="number" className="field-input" value={p.asking_price ?? ""} onChange={(e) => field("asking_price", e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="שם הבעלים"><input className="field-input" value={p.owner_name ?? ""} onChange={(e) => field("owner_name", e.target.value)} /></Field>
          <Field label="סוג עסקה">
            <select className="field-input" value={p.deal_type} onChange={(e) => field("deal_type", e.target.value as Property["deal_type"])}>
              <option value="sale">מכירה</option>
              <option value="rent">השכרה</option>
            </select>
          </Field>
          <Field label="תחילת בלעדיות"><input type="date" className="field-input" value={p.exclusivity_start ?? ""} onChange={(e) => field("exclusivity_start", e.target.value)} /></Field>
          <Field label="סיום בלעדיות"><input type="date" className="field-input" value={p.exclusivity_end ?? ""} onChange={(e) => field("exclusivity_end", e.target.value)} /></Field>
          <Field label="עמלת מכירה (%)"><input type="number" step="0.1" className="field-input" value={p.fee_sale_percent ?? ""} onChange={(e) => field("fee_sale_percent", e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="עמלת השכרה"><input className="field-input" value={p.fee_rent_text ?? ""} onChange={(e) => field("fee_rent_text", e.target.value)} /></Field>
          <Field label="מספר טופס"><input className="field-input" value={p.form_number ?? ""} onChange={(e) => field("form_number", e.target.value)} /></Field>
          <Field label="תאריך ההסכם"><input type="date" className="field-input" value={p.agreement_date ?? ""} onChange={(e) => field("agreement_date", e.target.value)} /></Field>
        </div>
        <div className="mt-4">
          <Field label="הערות"><textarea className="field-input min-h-[80px]" value={p.notes ?? ""} onChange={(e) => field("notes", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="בעלים / לקוחות בהסכם">
        <OwnersEditor propertyId={id} />
      </Section>

      <Section title="תמונות וסרטונים">
        <MediaManager
          propertyId={id}
          coverUrl={p.cover_image_url}
          onCoverChange={async (url) => {
            field("cover_image_url", url);
            await supabase.from("properties").update({ cover_image_url: url }).eq("id", id);
          }}
        />
      </Section>

      <Section title="חתימות וטופס חתום">
        <div className="grid gap-4 md:grid-cols-2">
          <SignaturePad label="חתימת הלקוח / בעלים" value={p.owner_signature} onChange={(v) => field("owner_signature", v)} />
          <SignaturePad label="חתימת המתווך" value={p.agent_signature} onChange={(v) => field("agent_signature", v)} />
        </div>
        <div className="mt-4">
          <label className="field-label">העלאת סריקות של הטופס החתום (ניתן לבחור כמה קבצים)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="field-input"
            onChange={(e) => {
              if (e.target.files?.length) uploadScans(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        {forms.length > 0 && (
          <ul className="mt-4 space-y-2">
            {forms.map((url, i) => (
              <li
                key={url}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-700 hover:underline">
                  צפייה בטופס {i + 1} ↗
                </a>
                <button
                  type="button"
                  onClick={() => removeScan(url)}
                  className="text-sm font-semibold text-red-600 hover:underline"
                >
                  מחיקה
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/90 py-3 backdrop-blur">
        {msg && <span className="text-sm font-semibold text-green-600">{msg}</span>}
        <Link href="/" className="btn btn-secondary">חזרה</Link>
        <button onClick={save} className="btn btn-primary" disabled={saving}>
          {saving ? "שומר…" : "שמירת שינויים"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 border-r-4 border-brand-500 pr-2 text-lg font-bold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function InfoBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: string;
}) {
  const tone =
    highlight === "expired" || highlight === "critical"
      ? "border-red-200 bg-red-50"
      : highlight === "warning"
      ? "border-amber-200 bg-amber-50"
      : "border-slate-200 bg-slate-50";
  return (
    <div className={cn("rounded-xl border p-3", tone)}>
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="text-base font-bold text-slate-800">{value}</div>
    </div>
  );
}
