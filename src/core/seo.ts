import type { SiteConfig } from "./schema";
import { confirmedValue } from "./facts";
import { openingHoursSpecification } from "./hours";
import { routeMeta, type RouteEntry } from "./routes";

export type BuildEnv = {
  /** True only for a deliberate production build (`--production`). */
  production: boolean;
};

/**
 * Indexing is opt-in. A page is indexable only when ALL of these hold:
 * production build, site not in demo mode, canonical origin configured,
 * and the route itself is not marked noindex (404).
 * Previews, staging and demos are therefore noindex by default.
 */
export function isIndexable(site: SiteConfig, env: BuildEnv, route?: RouteEntry): boolean {
  if (!env.production || site.demo || !site.origin) return false;
  if (route && routeMeta(site, route).noindex) return false;
  return true;
}

export const absoluteUrl = (site: SiteConfig, path: string) => (site.origin ? new URL(path, site.origin).toString() : undefined);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** JSON for <script type="application/ld+json">: escape "<" so content can never close the tag. */
export const safeJson = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

type Json = Record<string, unknown>;

/**
 * Structured data for a route. Built ONLY from confirmed facts, and only for
 * non-demo sites. With `preview: true` it ignores those rules so the build
 * report can show what will be emitted once facts are confirmed. Preview
 * output is never written into a page.
 */
export function structuredData(site: SiteConfig, route: RouteEntry, opts: { preview?: boolean } = {}): Json[] {
  const preview = opts.preview === true;
  if (site.demo && !preview) return [];
  const pick = <T>(f: { value: T; status: string } | undefined): T | undefined => (preview ? f?.value : confirmedValue(f as never));
  const out: Json[] = [];
  const meta = routeMeta(site, route);
  const url = (p: string) => absoluteUrl(site, p) ?? p;

  if (meta.breadcrumbs.length > 1 && (site.origin || preview)) {
    out.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: meta.breadcrumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: url(c.path) })),
    });
  }

  const address = pick(site.business.address);
  const businessNode = (): Json | null => {
    if (site.family === "product") return null;
    if (!address) return null; // a local business without a confirmed address is not emitted
    const node: Json = {
      "@context": "https://schema.org",
      "@type": site.business.schemaType,
      name: site.brand.name,
      description: site.business.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: address.street,
        addressLocality: address.locality,
        addressRegion: address.region,
        postalCode: address.postalCode,
        addressCountry: address.country,
      },
    };
    if (site.origin) node.url = site.origin;
    const phone = pick(site.business.phone);
    if (phone) node.telephone = phone;
    const hours = pick(site.business.hours);
    if (hours) node.openingHoursSpecification = openingHoursSpecification(hours);
    const area = pick(site.business.serviceArea);
    if (area) node.areaServed = area.map((name) => ({ "@type": "Place", name }));
    const sameAs = site.business.social.map((s) => pick(s.href)).filter(Boolean);
    if (sameAs.length) node.sameAs = sameAs;
    return node;
  };

  if (route.kind === "page" && route.page.path === "/") {
    const biz = businessNode();
    if (biz) out.push(biz);
    if (site.family === "product") {
      const app = pick(site.business.appUrl);
      out.push({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: site.brand.name,
        description: site.business.description,
        applicationCategory: "BusinessApplication",
        ...(app ? { url: app } : {}),
      });
    }
  }
  if (route.kind === "product") {
    const p = route.product;
    out.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: p.summary,
      category: p.category,
      offers: {
        "@type": "Offer",
        priceCurrency: site.catalog?.currency ?? "USD",
        price: (p.priceCents / 100).toFixed(2),
        availability: p.quantity === null ? undefined : p.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: url(route.path),
      },
    });
  }
  if (route.kind === "event" && address) {
    const e = route.event;
    out.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      description: e.summary,
      startDate: e.startsAt,
      ...(e.endsAt ? { endDate: e.endsAt } : {}),
      eventStatus: e.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: site.brand.name,
        address: {
          "@type": "PostalAddress",
          streetAddress: address.street,
          addressLocality: address.locality,
          addressRegion: address.region,
          postalCode: address.postalCode,
        },
      },
      ...(e.entryFeeCents !== null
        ? { offers: { "@type": "Offer", price: (e.entryFeeCents / 100).toFixed(2), priceCurrency: "USD", url: url(route.path) } }
        : {}),
    });
  }
  if (route.kind === "post") {
    out.push({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: route.post.title,
      datePublished: route.post.publishedAt,
      description: route.post.summary,
      publisher: { "@type": "Organization", name: site.brand.name },
    });
  }
  return out;
}

export function documentTitle(site: SiteConfig, route: RouteEntry): string {
  return routeMeta(site, route).title;
}

/** All <head> tags for a route, as an HTML string. */
export function headTags(site: SiteConfig, route: RouteEntry, env: BuildEnv): string {
  const meta = routeMeta(site, route);
  const canonical = absoluteUrl(site, route.path);
  const indexable = isIndexable(site, env, route);
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="${indexable ? "index, follow" : "noindex, nofollow"}">`,
    `<meta name="theme-color" content="${site.theme.colors.bg}">`,
    `<meta property="og:type" content="${route.kind === "post" ? "article" : "website"}">`,
    `<meta property="og:site_name" content="${esc(site.brand.name)}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:locale" content="${site.locale.replace("-", "_")}">`,
    `<meta name="twitter:card" content="summary">`,
  ];
  if (canonical && route.kind !== "not-found") {
    tags.push(`<link rel="canonical" href="${esc(canonical)}">`, `<meta property="og:url" content="${esc(canonical)}">`);
  }
  for (const node of structuredData(site, route)) tags.push(`<script type="application/ld+json">${safeJson(node)}</script>`);
  return tags.join("\n    ");
}

export function robotsTxt(site: SiteConfig, env: BuildEnv): string {
  if (!isIndexable(site, env)) return "# Not a production build of a live site: keep crawlers out.\nUser-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(site, "/sitemap.xml")}\n`;
}

export function sitemapXml(site: SiteConfig, routes: RouteEntry[], env: BuildEnv): string | null {
  if (!isIndexable(site, env)) return null;
  const urls = routes
    .filter((r) => r.kind !== "not-found")
    .map((r) => `  <url><loc>${esc(absoluteUrl(site, r.path)!)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * Launch gate. A production build fails unless every check passes, so a
 * demo or a site with unconfirmed facts cannot be published by accident.
 */
export function launchProblems(site: SiteConfig): string[] {
  const problems: string[] = [];
  if (site.demo) problems.push("site.demo is true");
  if (!site.origin) problems.push("site.origin is not set (needed for canonical URLs and the sitemap)");
  const b = site.business;
  const facts: [string, { status: string } | undefined][] = [
    ["business.phone", b.phone],
    ["business.email", b.email],
    ["business.address", b.address],
    ["business.hours", b.hours],
    ["business.serviceArea", b.serviceArea],
    ["business.appUrl", b.appUrl],
    ...b.social.map((s, i) => [`business.social[${i}] (${s.label})`, s.href] as [string, { status: string }]),
  ];
  for (const [name, f] of facts) {
    if (f && f.status === "demo") problems.push(`${name} is demo content`);
  }
  for (const [name, f] of facts) {
    if (f && f.status === "unconfirmed") problems.push(`${name} is unconfirmed (it will be hidden in a live build — confirm it or remove it)`);
  }
  if (site.catalog?.provider.provider === "fixture") problems.push("catalog uses fixture (sample) data");
  for (const [name, form] of Object.entries(site.forms)) {
    if (form.provider.provider === "demo") problems.push(`form "${name}" uses the demo provider and sends nothing`);
  }
  return problems;
}
