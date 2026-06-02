"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { PropertyOwner } from "@/lib/types";

interface Row {
  id?: string;
  full_name: string;
  id_number: string;
  phone: string;
  address: string;
}

function toRow(o: PropertyOwner): Row {
  return {
    id: o.id,
    full_name: o.full_name ?? "",
    id_number: o.id_number ?? "",
    phone: o.phone ?? "",
    address: o.address ?? "",
  };
}

export default function OwnersEditor({ propertyId }: { propertyId: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("property_owners")
      .select("*")
      .eq("property_id", propertyId)
      .order("sort_order", { ascending: true });
    setRows((data ?? []).map(toRow));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  function set(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function removeRow(i: number) {
    const row = rows[i];
    if (row.id) await supabase.from("property_owners").delete().eq("id", row.id);
    setRows((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const payload = {
          property_id: propertyId,
          full_name: r.full_name || null,
          id_number: r.id_number || null,
          phone: r.phone || null,
          address: r.address || null,
          sort_order: i,
        };
        if (r.id) await supabase.from("property_owners").update(payload).eq("id", r.id);
        else await supabase.from("property_owners").insert(payload);
      }
      setMsg("נשמר");
      await load();
    } catch {
      setMsg("שגיאה בשמירה");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2000);
    }
  }

  if (loading) return <p className="text-slate-500">טוען…</p>;

  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <div key={r.id ?? i} className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">לקוח {i + 1}</span>
            <button type="button" className="text-xs font-semibold text-red-600 hover:underline" onClick={() => removeRow(i)}>
              הסרה
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input className="field-input" placeholder="שם מלא" value={r.full_name} onChange={(e) => set(i, { full_name: e.target.value })} />
            <input className="field-input" placeholder="ת.ז" value={r.id_number} onChange={(e) => set(i, { id_number: e.target.value })} />
            <input className="field-input" placeholder="טלפון" value={r.phone} onChange={(e) => set(i, { phone: e.target.value })} />
            <input className="field-input" placeholder="כתובת" value={r.address} onChange={(e) => set(i, { address: e.target.value })} />
          </div>
        </div>
      ))}
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setRows((prev) => [...prev, { full_name: "", id_number: "", phone: "", address: "" }])}
        >
          + הוספת לקוח
        </button>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "שומר…" : "שמירת לקוחות"}
        </button>
        {msg && <span className="self-center text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  );
}
