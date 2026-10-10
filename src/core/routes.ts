import type { EventItem, Page, PostItem, Product, SiteConfig } from "./schema";
import type { ProviderResult } from "../integrations/result";

export type RouteEntry =
  | { kind: "page"; path: string; page: Page }
  | { kind: "product"; path: string; product: Product }
  | { kind: "event"; path: string; event: EventItem }
  | { kind: "post"; path: string; post: PostItem }
  | { kind: "not-found"; path: "/404/" };

/** Everything a page needs to render, serialised into the HTML for hydration. */
export type PageProps = {
  route: RouteEntry;
  catalog: ProviderResult<Product[]> | null;
};

export type Crumb = { label: string; path: string };

export type RouteMeta = {
  title: string;
  description: string;
  breadcrumbs: Crumb[];
  /** Pages that must never be indexed regardless of environment. */
  noindex?: boolean;
};

export function buildRoutes(site: SiteConfig, catalog: ProviderResult<Product[]>): RouteEntry[] {
  const routes: RouteEntry[] = site.pages.map((page) => ({ kind: "page" as const, path: page.path, page }));
  if (site.catalog && catalog.status === "ok") {
    for (const product of catalog.data) routes.push({ kind: "product", path: `${site.catalog.basePath}${product.slug}/`, product });
  }
  for (const event of site.events?.items ?? []) routes.push({ kind: "event", path: `${site.events!.basePath}${event.slug}/`, event });
  for (const post of site.posts?.items ?? []) routes.push({ kind: "post", path: `${site.posts!.basePath}${post.slug}/`, post });
  routes.push({ kind: "not-found", path: "/404/" });
  const seen = new Set<string>();
  for (const r of routes) {
    if (seen.has(r.path)) throw new Error(`Route collision at ${r.path} in site ${site.id}`);
    seen.add(r.path);
  }
  return routes;
}

export function pageNeedsCatalog(route: RouteEntry): boolean {
  return route.kind === "page" && route.page.sections.some((s) => s.type === "catalog" && !s.hidden);
}

const clip = (s: string, n = 160) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);

function parentCrumb(site: SiteConfig, basePath: string): Crumb[] {
  const page = site.pages.find((p) => p.path === basePath);
  if (!page) return [];
  const nav = site.nav.find((n) => n.href === basePath);
  return [{ label: nav?.label ?? page.heading ?? page.title, path: basePath }];
}

export function routeMeta(site: SiteConfig, route: RouteEntry): RouteMeta {
  const home: Crumb = { label: "Home", path: "/" };
  switch (route.kind) {
    case "page": {
      const nav = site.nav.find((n) => n.href === route.page.path);
      const crumbs = route.page.path === "/" ? [] : [home, { label: nav?.label ?? route.page.heading ?? route.page.title, path: route.page.path }];
      return { title: route.page.title, description: route.page.description, breadcrumbs: crumbs };
    }
    case "product":
      return {
        title: `${route.product.name} | ${site.brand.shortName}`.slice(0, 70),
        description: clip(route.product.summary),
        breadcrumbs: [home, ...parentCrumb(site, site.catalog!.basePath), { label: route.product.name, path: route.path }],
      };
    case "event": {
      // Recurring events share a name, so the date keeps every title unique.
      const tz = site.business.hours?.value.timezone ?? "America/New_York";
      const date = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric" }).format(new Date(route.event.startsAt));
      return {
        title: `${route.event.title}, ${date} | ${site.brand.shortName}`.slice(0, 70),
        description: clip(route.event.summary),
        breadcrumbs: [home, ...parentCrumb(site, site.events!.basePath), { label: route.event.title, path: route.path }],
      };
    }
    case "post":
      return {
        title: `${route.post.title} | ${site.brand.shortName}`.slice(0, 70),
        description: clip(route.post.summary),
        breadcrumbs: [home, ...parentCrumb(site, site.posts!.basePath), { label: route.post.title, path: route.path }],
      };
    case "not-found":
      return {
        title: `Page not found | ${site.brand.shortName}`,
        description: "The page you were looking for could not be found.",
        breadcrumbs: [],
        noindex: true,
      };
  }
}
