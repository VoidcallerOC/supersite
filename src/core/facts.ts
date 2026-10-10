import type { Fact, SiteConfig } from "./schema";

export type FactView<T> = { show: false } | { show: true; value: T; tag: "confirm" | "demo" | null };

/**
 * Decide whether a fact may be shown and how it is labelled.
 *
 * - confirmed: shown, no tag.
 * - unconfirmed: shown with a "to confirm" tag in demo builds; hidden in live builds.
 * - demo: shown with a "demo" tag in demo builds; never shown in live builds.
 */
export function viewFact<T>(site: Pick<SiteConfig, "demo">, f: Fact<T> | undefined): FactView<T> {
  if (!f) return { show: false };
  if (f.status === "confirmed") return { show: true, value: f.value, tag: null };
  if (!site.demo) return { show: false };
  return { show: true, value: f.value, tag: f.status === "demo" ? "demo" : "confirm" };
}

/** Only confirmed facts may be published as machine-readable claims. */
export function confirmedValue<T>(f: Fact<T> | undefined): T | undefined {
  return f && f.status === "confirmed" ? f.value : undefined;
}

export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

export function directionsHref(a: { street: string; locality: string; region: string; postalCode: string }): string {
  const q = encodeURIComponent(`${a.street}, ${a.locality}, ${a.region} ${a.postalCode}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${q}`;
}
