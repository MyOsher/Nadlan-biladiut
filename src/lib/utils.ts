import type { DealType, PropertyStatus } from "./types";

export const DEAL_TYPE_LABEL: Record<DealType, string> = {
  sale: "מכירה",
  rent: "השכרה",
};

export const STATUS_LABEL: Record<PropertyStatus, string> = {
  active: "פעיל",
  sold: "נמכר",
  rented: "הושכר",
  expired: "פג תוקף",
  cancelled: "בוטל",
  draft: "טיוטה",
};

export const STATUS_CLASS: Record<PropertyStatus, string> = {
  active: "bg-green-100 text-green-800",
  sold: "bg-blue-100 text-blue-800",
  rented: "bg-blue-100 text-blue-800",
  expired: "bg-gray-200 text-gray-700",
  cancelled: "bg-gray-200 text-gray-500",
  draft: "bg-amber-100 text-amber-800",
};

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Whole days from today until the given date (negative = already past). */
export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export interface ExclusivityState {
  days: number | null;
  label: string;
  className: string;
  level: "expired" | "critical" | "warning" | "ok" | "none";
}

/** Visual state for the exclusivity end date. */
export function exclusivityState(endDate: string | null | undefined): ExclusivityState {
  const days = daysUntil(endDate);
  if (days === null) {
    return { days: null, label: "ללא תאריך סיום", className: "bg-gray-100 text-gray-500", level: "none" };
  }
  if (days < 0) {
    return {
      days,
      label: `פג תוקף לפני ${Math.abs(days)} ימים`,
      className: "bg-red-100 text-red-800",
      level: "expired",
    };
  }
  if (days === 0) {
    return { days, label: "מסתיים היום", className: "bg-red-100 text-red-800", level: "critical" };
  }
  if (days <= 7) {
    return {
      days,
      label: `נותרו ${days} ימים`,
      className: "bg-orange-100 text-orange-800",
      level: "critical",
    };
  }
  if (days <= 14) {
    return {
      days,
      label: `נותרו ${days} ימים`,
      className: "bg-amber-100 text-amber-800",
      level: "warning",
    };
  }
  return {
    days,
    label: `נותרו ${days} ימים`,
    className: "bg-green-100 text-green-800",
    level: "ok",
  };
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
