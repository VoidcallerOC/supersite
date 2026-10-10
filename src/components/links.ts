import type { Cta, Fact, SiteConfig } from "../core/schema";
import { directionsHref, telHref, viewFact } from "../core/facts";

/**
 * Resolve special CTA targets ($phone, $email, $directions, $app) from facts.
 * A fact can only become a link when it is real: confirmed, or unconfirmed in
 * a demo build. Demo-only values (fictional numbers, addresses, app URLs) are
 * never linked, so a demo never sends a visitor somewhere that does not exist.
 */
export function resolveFactHref(site: SiteConfig, href: string): string | null {
  const linkable = <T>(f: Fact<T> | undefined): T | null => {
    const v = viewFact(site, f);
    return v.show && v.tag !== "demo" ? v.value : null;
  };
  switch (href) {
    case "$phone": {
      const v = linkable(site.business.phone);
      return v ? telHref(v) : null;
    }
    case "$email": {
      const v = linkable(site.business.email);
      return v ? `mailto:${v}` : null;
    }
    case "$directions": {
      const v = linkable(site.business.address);
      return v ? directionsHref(v) : null;
    }
    case "$app":
      return linkable(site.business.appUrl);
    default:
      return href;
  }
}

export type ResolvedCta = { label: string; href: string; variant: Cta["variant"]; external: boolean };

export function resolveCta(site: SiteConfig, cta: Cta): ResolvedCta | null {
  const href = resolveFactHref(site, cta.href);
  if (href) return { label: cta.label, href, variant: cta.variant, external: /^https?:/.test(href) };
  if (cta.fallback) return { label: cta.fallback.label, href: cta.fallback.href, variant: cta.variant, external: false };
  return null;
}

export const isCurrent = (currentPath: string, href: string) => href === currentPath || (href !== "/" && currentPath.startsWith(href));
