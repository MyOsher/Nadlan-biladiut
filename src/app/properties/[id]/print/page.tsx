"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Property, PropertyOwner } from "@/lib/types";
import { DEAL_TYPE_LABEL, formatCurrency, formatDate } from "@/lib/utils";

export default function PrintAgreementPage() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<Property | null>(null);
  const [owners, setOwners] = useState<PropertyOwner[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: prop }, { data: own }] = await Promise.all([
        supabase.from("properties").select("*").eq("id", id).single(),
        supabase.from("property_owners").select("*").eq("property_id", id).order("sort_order"),
      ]);
      setP(prop ?? null);
      setOwners(own ?? []);
    })();
  }, [id]);

  if (!p) return <p className="p-10 text-center text-slate-500">טוען…</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-4 flex justify-end gap-2">
        <button onClick={() => window.print()} className="btn btn-primary">
          הדפסה / שמירה כ-PDF
        </button>
      </div>

      <div className="rounded-xl border border-slate-300 bg-white p-8 leading-relaxed text-slate-900">
        <div className="mb-4 flex items-center justify-between border-b-2 border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-extrabold">הזמנת שירותי תיווך בבלעדיות</h1>
            <p className="text-sm text-slate-600">(על פי חוק המתווכים במקרקעין)</p>
          </div>
          <div className="text-sm">
            <div>תאריך: {formatDate(p.agreement_date)}</div>
            {p.form_number && <div>מס׳ טופס: {p.form_number}</div>}
          </div>
        </div>

        <p className="mb-3 text-sm">
          אנו פונים ל{p.agent_name ? `מתווך ${p.agent_name}` : '"הנכס"'}
          {p.agent_id_number ? `, ת.ז ${p.agent_id_number}` : ""} לקבלת שירותי תיווך עבור הנכס הרשום מטה.
        </p>

        <Block n="1" title="פרטי הלקוח / בעלים">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="p-1 text-right">שם</th>
                <th className="p-1 text-right">ת.ז</th>
                <th className="p-1 text-right">טלפון</th>
                <th className="p-1 text-right">כתובת</th>
              </tr>
            </thead>
            <tbody>
              {(owners.length ? owners : [null]).map((o, i) => (
                <tr key={i} className="border-b">
                  <td className="p-1">{o?.full_name || "—"}</td>
                  <td className="p-1">{o?.id_number || "—"}</td>
                  <td className="p-1">{o?.phone || "—"}</td>
                  <td className="p-1">{o?.address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>

        <Block n="2" title="סוג העסקה ותיאור הנכס">
          <p className="text-sm">
            סוג עסקה: <strong>{DEAL_TYPE_LABEL[p.deal_type]}</strong> · גוש: {p.block || "—"} · חלקה:{" "}
            {p.parcel || "—"} · תת חלקה: {p.sub_parcel || "—"}
          </p>
        </Block>

        <Block n="3" title="הצהרת בעל הזכויות">
          <table className="w-full border text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-600">
                <th className="border p-2">סוג הנכס</th>
                <th className="border p-2">כתובת הנכס</th>
                <th className="border p-2">שם הבעלים</th>
                <th className="border p-2">מחיר מבוקש</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{p.property_type || "—"}</td>
                <td className="border p-2">
                  {[p.property_address, p.city].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="border p-2">{p.owner_name || "—"}</td>
                <td className="border p-2 font-bold">{formatCurrency(p.asking_price)}</td>
              </tr>
            </tbody>
          </table>
        </Block>

        <Block n="4" title="דמי התיווך">
          <p className="text-sm">
            א. מכירה/קנייה: {p.fee_sale_percent ?? 2}% ממחיר העסקה בתוספת מע״מ.
            <br />
            ב. השכרה: {p.fee_rent_text || "שווי של חודש שכירות"} בתוספת מע״מ.
          </p>
        </Block>

        <Block n="5" title="תקופת הבלעדיות">
          <p className="text-sm">
            הבלעדיות תחל בתאריך <strong>{formatDate(p.exclusivity_start)}</strong> ועד לתאריך{" "}
            <strong>{formatDate(p.exclusivity_end)}</strong>.
          </p>
        </Block>

        {p.notes && (
          <Block n="6" title="הערות">
            <p className="whitespace-pre-wrap text-sm">{p.notes}</p>
          </Block>
        )}

        <div className="mt-10 grid grid-cols-2 gap-8">
          <SignatureLine label="חתימת הלקוח / בעלים" src={p.owner_signature} />
          <SignatureLine label="חתימת המתווך" src={p.agent_signature} />
        </div>
      </div>
    </div>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="mb-2 font-bold">
        {n}. {title}
      </h2>
      {children}
    </div>
  );
}

function SignatureLine({ label, src }: { label: string; src: string | null }) {
  return (
    <div className="text-center">
      <div className="flex h-20 items-end justify-center border-b border-slate-800">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="max-h-20" />
        ) : null}
      </div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}
