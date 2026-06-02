"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { AppSettings } from "@/lib/types";

export default function SettingsPage() {
  const [s, setS] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("*").eq("id", 1).single();
      setS(data);
    })();
  }, []);

  function field<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setS((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!s) return;
    setSaving(true);
    setMsg(null);
    const { error } = await supabase
      .from("app_settings")
      .update({
        agent_name: s.agent_name,
        agent_id_number: s.agent_id_number,
        agent_email: s.agent_email,
        agent_phone: s.agent_phone,
        default_sale_fee_percent: s.default_sale_fee_percent,
        default_rent_fee_text: s.default_rent_fee_text,
        reminder_days: s.reminder_days,
      })
      .eq("id", 1);
    setMsg(error ? `שגיאה: ${error.message}` : "ההגדרות נשמרו");
    setSaving(false);
    setTimeout(() => setMsg(null), 2500);
  }

  if (!s) return <p className="py-10 text-center text-slate-500">טוען…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">הגדרות</h1>
        <Link href="/" className="btn btn-secondary">
          חזרה
        </Link>
      </div>

      <section className="card space-y-4 p-5">
        <h2 className="border-r-4 border-brand-500 pr-2 text-lg font-bold">פרטי המתווך</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="שם המתווך">
            <input className="field-input" value={s.agent_name ?? ""} onChange={(e) => field("agent_name", e.target.value)} />
          </Field>
          <Field label="ת.ז / רישיון">
            <input className="field-input" value={s.agent_id_number ?? ""} onChange={(e) => field("agent_id_number", e.target.value)} />
          </Field>
          <Field label="דוא״ל לקבלת תזכורות">
            <input type="email" className="field-input" value={s.agent_email ?? ""} onChange={(e) => field("agent_email", e.target.value)} placeholder="name@example.com" />
          </Field>
          <Field label="טלפון">
            <input className="field-input" value={s.agent_phone ?? ""} onChange={(e) => field("agent_phone", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="border-r-4 border-brand-500 pr-2 text-lg font-bold">ברירות מחדל לעמלות</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="עמלת מכירה ברירת מחדל (%)">
            <input type="number" step="0.1" className="field-input" value={s.default_sale_fee_percent ?? ""} onChange={(e) => field("default_sale_fee_percent", e.target.value ? Number(e.target.value) : null)} />
          </Field>
          <Field label="עמלת השכרה ברירת מחדל">
            <input className="field-input" value={s.default_rent_fee_text ?? ""} onChange={(e) => field("default_rent_fee_text", e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="border-r-4 border-brand-500 pr-2 text-lg font-bold">תזכורות בלעדיות</h2>
        <Field label="מספר ימים לפני סיום הבלעדיות לקבלת תזכורת (מופרד בפסיקים)">
          <input
            className="field-input"
            value={(s.reminder_days ?? []).join(", ")}
            onChange={(e) =>
              field(
                "reminder_days",
                e.target.value
                  .split(",")
                  .map((x) => parseInt(x.trim(), 10))
                  .filter((n) => !isNaN(n))
              )
            }
            placeholder="14, 7, 3, 1"
          />
        </Field>
        <p className="text-xs text-slate-500">
          תזכורות הדוא״ל נשלחות אוטומטית על ידי פונקציית הרקע ב-Supabase (ראו README להגדרת מפתח שליחת
          הדוא״ל).
        </p>
      </section>

      <div className="flex items-center justify-end gap-3">
        {msg && <span className="text-sm font-semibold text-green-600">{msg}</span>}
        <button onClick={save} className="btn btn-primary" disabled={saving}>
          {saving ? "שומר…" : "שמירת הגדרות"}
        </button>
      </div>
    </div>
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
