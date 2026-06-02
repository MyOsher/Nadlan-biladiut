"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { DealType, Property, PropertyStatus } from "@/lib/types";
import {
  DEAL_TYPE_LABEL,
  STATUS_CLASS,
  STATUS_LABEL,
  cn,
  exclusivityState,
  formatCurrency,
  formatDate,
} from "@/lib/utils";

export default function DashboardPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dealFilter, setDealFilter] = useState<DealType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | "all">("all");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("exclusivity_end", { ascending: true, nullsFirst: false });
      if (error) setError(error.message);
      else setProperties(data ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const active = properties.filter((p) => p.status === "active");
    const expiringSoon = active.filter((p) => {
      const s = exclusivityState(p.exclusivity_end);
      return s.level === "warning" || s.level === "critical";
    });
    const expired = active.filter((p) => exclusivityState(p.exclusivity_end).level === "expired");
    const closed = properties.filter((p) => p.status === "sold" || p.status === "rented");
    return { total: properties.length, active: active.length, expiringSoon, expired, closed: closed.length };
  }, [properties]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (dealFilter !== "all" && p.deal_type !== dealFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return [p.property_address, p.city, p.owner_name, p.property_type, p.block, p.parcel]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [properties, search, dealFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">לוח בקרה — הנכסים שלי</h1>
          <p className="text-sm text-slate-500">מעקב אחר בלעדיות, מחירים, תמונות וסרטונים</p>
        </div>
        <Link href="/properties/new" className="btn btn-primary">
          + הוספת נכס חדש
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="סך הנכסים" value={stats.total} tone="slate" />
        <StatCard label="פעילים" value={stats.active} tone="green" />
        <StatCard label="בלעדיות מסתיימת בקרוב" value={stats.expiringSoon.length} tone="amber" />
        <StatCard label="פג תוקף" value={stats.expired.length} tone="red" />
      </div>

      {/* Expiring soon alerts */}
      {(stats.expiringSoon.length > 0 || stats.expired.length > 0) && (
        <div className="card border-amber-200 bg-amber-50/60 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-amber-900">
            ⏰ בלעדיות מסתיימת בקרוב / פגה
          </h2>
          <ul className="space-y-2">
            {[...stats.expired, ...stats.expiringSoon].map((p) => {
              const s = exclusivityState(p.exclusivity_end);
              return (
                <li key={p.id}>
                  <Link
                    href={`/properties/${p.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 shadow-sm hover:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-800">
                      {p.property_address || "נכס ללא כתובת"}
                      {p.city ? `, ${p.city}` : ""}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">סיום: {formatDate(p.exclusivity_end)}</span>
                      <span className={cn("badge", s.className)}>{s.label}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <input
          className="field-input max-w-xs flex-1"
          placeholder="חיפוש לפי כתובת, עיר, בעלים, גוש/חלקה…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="field-input w-auto"
          value={dealFilter}
          onChange={(e) => setDealFilter(e.target.value as DealType | "all")}
        >
          <option value="all">כל סוגי העסקה</option>
          <option value="sale">מכירה</option>
          <option value="rent">השכרה</option>
        </select>
        <select
          className="field-input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PropertyStatus | "all")}
        >
          <option value="all">כל הסטטוסים</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <p className="py-10 text-center text-slate-500">טוען נכסים…</p>
      ) : error ? (
        <p className="py-10 text-center text-red-600">שגיאה: {error}</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-slate-500">לא נמצאו נכסים.</p>
          <Link href="/properties/new" className="btn btn-primary mt-4">
            + הוספת הנכס הראשון
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "slate" | "green" | "amber" | "red";
}) {
  const tones: Record<string, string> = {
    slate: "text-slate-700",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className="card p-4">
      <div className={cn("text-3xl font-extrabold", tones[tone])}>{value}</div>
      <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

function PropertyCard({ property: p }: { property: Property }) {
  const s = exclusivityState(p.exclusivity_end);
  return (
    <Link href={`/properties/${p.id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="relative h-40 w-full bg-slate-100">
        {p.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.cover_image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-300">🏠</div>
        )}
        <span className="absolute right-2 top-2 badge bg-brand-600 text-white">
          {DEAL_TYPE_LABEL[p.deal_type]}
        </span>
        <span className={cn("badge absolute left-2 top-2", STATUS_CLASS[p.status])}>
          {STATUS_LABEL[p.status]}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-slate-800 line-clamp-1">
            {p.property_address || "נכס ללא כתובת"}
          </h3>
        </div>
        <p className="text-sm text-slate-500 line-clamp-1">
          {[p.property_type, p.city].filter(Boolean).join(" · ") || "—"}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-extrabold text-brand-700">{formatCurrency(p.asking_price)}</span>
          <span className={cn("badge", s.className)}>{s.label}</span>
        </div>
        <p className="text-xs text-slate-400">בעלים: {p.owner_name || "—"}</p>
      </div>
    </Link>
  );
}
