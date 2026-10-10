import { renderToString } from "react-dom/server";
import site from "virtual:site";
import { App } from "./App";
import { buildRoutes, pageNeedsCatalog, type PageProps, type RouteEntry } from "./core/routes";
import { headTags, launchProblems, robotsTxt, sitemapXml, structuredData, isIndexable, type BuildEnv } from "./core/seo";
import { themeCss } from "./core/theme-css";
import { loadCatalog } from "./integrations/catalog/load";
import type { ProviderResult } from "./integrations/result";
import type { Product } from "./core/schema";

/** Build-time API used by scripts/build.mjs. Nothing here runs in the browser. */
export { site };

/**
 * The validated config as the browser receives it: plain JSON (no schema
 * library in the client bundle) and without bulk catalog fixture data, which
 * pages receive through their own props instead.
 */
export function clientSite() {
  const copy = structuredClone(site);
  if (copy.catalog?.provider.provider === "fixture") copy.catalog.provider.items = [];
  return copy;
}

export async function prepare(env: BuildEnv) {
  const catalog: ProviderResult<Product[]> = site.catalog ? await loadCatalog(site.catalog.provider) : { status: "empty", warnings: [] };
  const routes = buildRoutes(site, catalog);
  return {
    routes,
    catalog,
    themeCss: themeCss(site.theme),
    robots: robotsTxt(site, env),
    sitemap: sitemapXml(site, routes, env),
    launchProblems: launchProblems(site),
    report: routes.map((r) => ({
      path: r.path,
      kind: r.kind,
      indexable: isIndexable(site, env, r),
      emittedStructuredData: structuredData(site, r).map((n) => n["@type"]),
      structuredDataOnceConfirmed: structuredData(site, r, { preview: true }),
    })),
  };
}

export function render(route: RouteEntry, catalog: ProviderResult<Product[]>, env: BuildEnv) {
  const props: PageProps = { route, catalog: pageNeedsCatalog(route) ? catalog : null };
  return {
    html: renderToString(<App site={site} props={props} />),
    head: headTags(site, route, env),
    props,
  };
}
