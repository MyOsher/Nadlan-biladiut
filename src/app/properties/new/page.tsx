"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, FORMS_BUCKET } from "@/lib/supabase";
import type { DealType } from "@/lib/types";
import SignaturePad from "@/components/SignaturePad";

interface OwnerDraft {
  full_name: string;
  id_number: string;
  phone: string;
  address: string;
}

const emptyOwner: OwnerDraft = { full_name: "", id_number: "", phone: "", address: "" };

export default function NewPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Agreement header
  const [agreementDate, setAgreementDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formNumber, setFormNumber] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [dealType, setDealType] = useState<DealType>("sale");

  // Owners / clients
  const [owners, setOwners] = useState<OwnerDraft[]>([{ ...emptyOwner }]);

  // Property description
  const [propertyType, setPropertyType] = useState("");
  const [rooms, setRooms] = useState("");
  const [sizeSqm, setSizeSqm] = useState("");
  const [floor, setFloor] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [block, setBlock] = useState("");
  const [parcel, setParcel] = useState("");
  const [subParcel, setSubParcel] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Fees
  const [feeSale, setFeeSale] = useState("2");
  const [feeRentText, setFeeRentText] = useState("שווי של חודש שכירות");

  // Exclusivity
  const [exStart, setExStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [exEnd, setExEnd] = useState<string>("");

  // Signatures + scan
  const [ownerSig, setOwnerSig] = useState<string | null>(null);
  const [agentSig, setAgentSig] = useState<string | null>(null);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  // Prefill agent + default fee from settings
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).single();
      if (data) {
        setAgentName(data.agent_name ?? "");
        setAgentId(data.agent_id_number ?? "");
        if (data.default_sale_fee_percent != null) setFeeSale(String(data.default_sale_fee_percent));
        if (data.default_rent_fee_text) setFeeRentText(data.default_rent_fee_text);
      }
    })();
  }, []);

  // When the start date changes, default the end date to +6 months if empty.
  useEffect(() => {
    if (exStart && !exEnd) {
      const d = new Date(exStart);
      d.setMonth(d.getMonth() + 6);
      setExEnd(d.toISOString().slice(0, 10));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exStart]);

  function setOwner(i: number, patch: Partial<OwnerDraft>) {
    setOwners((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Upload the scanned agreement first, if provided.
      let signedFormUrl: string | null = null;
      if (scanFile) {
        const path = `${crypto.randomUUID()}-${scanFile.name}`;
        const { error: upErr } = await supabase.storage.from(FORMS_BUCKET).upload(path, scanFile);
        if (upErr) throw upErr;
        signedFormUrl = supabase.storage.from(FORMS_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      const primaryOwner = owners.find((o) => o.full_name.trim());
      const { data: prop, error: insErr } = await supabase
        .from("properties")
        .insert({
          form_number: formNumber || null,
          agent_name: agentName || null,
          agent_id_number: agentId || null,
          deal_type: dealType,
          status: "active",
          property_type: propertyType || null,
          rooms: rooms ? Number(rooms) : null,
          size_sqm: sizeSqm ? Number(sizeSqm) : null,
          floor: floor || null,
          property_address: address || null,
          city: city || null,
          block: block || null,
          parcel: parcel || null,
          sub_parcel: subParcel || null,
          asking_price: askingPrice ? Number(askingPrice) : null,
          owner_name: ownerName || primaryOwner?.full_name || null,
          exclusivity_start: exStart || null,
          exclusivity_end: exEnd || null,
          fee_sale_percent: feeSale ? Number(feeSale) : null,
          fee_rent_text: feeRentText || null,
          agreement_date: agreementDate || null,
          notes: notes || null,
          owner_signature: ownerSig,
          agent_signature: agentSig,
          signed_digitally_at: ownerSig || agentSig ? new Date().toISOString() : null,
          signed_form_url: signedFormUrl,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      const ownerRows = owners
        .filter((o) => o.full_name.trim() || o.id_number.trim() || o.phone.trim())
        .map((o, idx) => ({
          property_id: prop!.id,
          full_name: o.full_name || null,
          id_number: o.id_number || null,
          phone: o.phone || null,
          address: o.address || null,
          sort_order: idx,
        }));
      if (ownerRows.length) {
        const { error: ownErr } = await supabase.from("property_owners").insert(ownerRows);
        if (ownErr) throw ownErr;
      }

      router.push(`/properties/${prop!.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "אירעה שגיאה בשמירה");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">הזמנת שירותי תיווך בבלעדיות — נכס חדש</h1>
        <Link href="/" className="btn btn-secondary">
          ביטול
        </Link>
      </div>

      {error && <div className="card border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* 0. Header */}
      <Section title="פרטי ההזמנה">
        <Grid>
          <Field label="תאריך">
            <input type="date" className="field-input" value={agreementDate} onChange={(e) => setAgreementDate(e.target.value)} />
          </Field>
          <Field label="מספר טופס">
            <input className="field-input" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} placeholder="0693" />
          </Field>
          <Field label="שם המתווך / סוכן">
            <input className="field-input" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
          </Field>
          <Field label="ת.ז המתווך">
            <input className="field-input" value={agentId} onChange={(e) => setAgentId(e.target.value)} />
          </Field>
          <Field label="סוג עסקה">
            <div className="flex gap-2">
              <ToggleBtn active={dealType === "sale"} onClick={() => setDealType("sale")}>
                מכירה
              </ToggleBtn>
              <ToggleBtn active={dealType === "rent"} onClick={() => setDealType("rent")}>
                השכרה
              </ToggleBtn>
            </div>
          </Field>
        </Grid>
      </Section>

      {/* 1. Clients / owners */}
      <Section title="פרטי הלקוח / בעלים">
        <div className="space-y-4">
          {owners.map((o, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">לקוח {i + 1}</span>
                {owners.length > 1 && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 hover:underline"
                    onClick={() => setOwners((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    הסרה
                  </button>
                )}
              </div>
              <Grid>
                <Field label="שם מלא">
                  <input className="field-input" value={o.full_name} onChange={(e) => setOwner(i, { full_name: e.target.value })} />
                </Field>
                <Field label="ת.ז">
                  <input className="field-input" value={o.id_number} onChange={(e) => setOwner(i, { id_number: e.target.value })} />
                </Field>
                <Field label="טלפון">
                  <input className="field-input" value={o.phone} onChange={(e) => setOwner(i, { phone: e.target.value })} />
                </Field>
                <Field label="כתובת">
                  <input className="field-input" value={o.address} onChange={(e) => setOwner(i, { address: e.target.value })} />
                </Field>
              </Grid>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={() => setOwners((prev) => [...prev, { ...emptyOwner }])}>
            + הוספת לקוח
          </button>
        </div>
      </Section>

      {/* 2. Property description */}
      <Section title="תיאור הנכס">
        <Grid>
          <Field label="סוג הנכס">
            <input className="field-input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} placeholder="דירה 4.5 חדרים" />
          </Field>
          <Field label="מספר חדרים">
            <input type="number" step="0.5" className="field-input" value={rooms} onChange={(e) => setRooms(e.target.value)} />
          </Field>
          <Field label="שטח (מ״ר)">
            <input type="number" className="field-input" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
          </Field>
          <Field label="קומה">
            <input className="field-input" value={floor} onChange={(e) => setFloor(e.target.value)} />
          </Field>
          <Field label="כתובת הנכס">
            <input className="field-input" value={address} onChange={(e) => setAddress(e.target.value)} />
          </Field>
          <Field label="עיר">
            <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
          <Field label="גוש">
            <input className="field-input" value={block} onChange={(e) => setBlock(e.target.value)} />
          </Field>
          <Field label="חלקה">
            <input className="field-input" value={parcel} onChange={(e) => setParcel(e.target.value)} />
          </Field>
          <Field label="תת חלקה">
            <input className="field-input" value={subParcel} onChange={(e) => setSubParcel(e.target.value)} />
          </Field>
          <Field label="מחיר מבוקש (₪)">
            <input type="number" className="field-input" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="3500000" />
          </Field>
          <Field label="שם הבעלים (להסכם)">
            <input className="field-input" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          </Field>
        </Grid>
      </Section>

      {/* 3. Fees */}
      <Section title="דמי תיווך">
        <Grid>
          <Field label="עמלת מכירה (%)">
            <input type="number" step="0.1" className="field-input" value={feeSale} onChange={(e) => setFeeSale(e.target.value)} />
          </Field>
          <Field label="עמלת השכרה">
            <input className="field-input" value={feeRentText} onChange={(e) => setFeeRentText(e.target.value)} />
          </Field>
        </Grid>
      </Section>

      {/* 4. Exclusivity */}
      <Section title="תקופת בלעדיות">
        <Grid>
          <Field label="תאריך תחילה">
            <input type="date" className="field-input" value={exStart} onChange={(e) => setExStart(e.target.value)} />
          </Field>
          <Field label="תאריך סיום">
            <input type="date" className="field-input" value={exEnd} onChange={(e) => setExEnd(e.target.value)} />
          </Field>
        </Grid>
        <div className="mt-3 flex gap-2">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              type="button"
              className="btn btn-secondary text-xs"
              onClick={() => {
                const d = new Date(exStart || new Date());
                d.setMonth(d.getMonth() + m);
                setExEnd(d.toISOString().slice(0, 10));
              }}
            >
              {m} חודשים
            </button>
          ))}
        </div>
      </Section>

      {/* 5. Signatures + scan */}
      <Section title="חתימות וטופס חתום">
        <div className="grid gap-4 md:grid-cols-2">
          <SignaturePad label="חתימת הלקוח / בעלים" value={ownerSig} onChange={setOwnerSig} />
          <SignaturePad label="חתימת המתווך" value={agentSig} onChange={setAgentSig} />
        </div>
        <div className="mt-4">
          <label className="field-label">העלאת סריקה/צילום של הטופס החתום (PDF או תמונה)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="field-input"
            onChange={(e) => setScanFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="mt-4">
          <Field label="הערות">
            <textarea className="field-input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </div>
      </Section>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-slate-50/90 py-3 backdrop-blur">
        <Link href="/" className="btn btn-secondary">
          ביטול
        </Link>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "שומר…" : "שמירת הנכס"}
        </button>
      </div>
    </form>
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

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "btn flex-1 " + (active ? "btn-primary" : "btn-secondary")
      }
    >
      {children}
    </button>
  );
}
