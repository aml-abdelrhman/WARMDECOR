import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Class merger ─────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Price ────────────────────────────────────────────────────────────────────

export function formatPrice(
  amount: number,
  currency = "EGP",
  locale   = "en-EG"
): string {
  return amount.toLocaleString(locale, {
    style:                "currency",
    currency,
    maximumFractionDigits: 0,
  });
}

export function calcDiscountPct(original: number, discounted: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = {
    year:  "numeric",
    month: "short",
    day:   "numeric",
  }
): string {
  return new Date(iso).toLocaleDateString("en-EG", opts);
}

// ─── String ───────────────────────────────────────────────────────────────────

export function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max).trimEnd() + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Array ────────────────────────────────────────────────────────────────────

export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

// ─── Number ───────────────────────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}