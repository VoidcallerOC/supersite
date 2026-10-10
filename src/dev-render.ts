import site from "virtual:site";
import { buildRoutes, pageNeedsCatalog, routeMeta, type PageProps } from "./core/routes";
import { themeCss } from "./core/theme-css";
import { loadCatalog } from "./integrations/catalog/load";

/** Dev-server convenience only; production pages are prerendered by scripts/build.mjs. */
export const devThemeCss = () => themeCss(site.theme);

export async function devProps(pathname: string): Promise<PageProps> {
  const catalog = site.catalog ? await loadCatalog(site.catalog.provider) : null;
  const routes = buildRoutes(site, catalog ?? { status: "empty", warnings: [] });
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const route = routes.find((r) => r.path === path) ?? routes.find((r) => r.kind === "not-found")!;
  document.title = routeMeta(site, route).title;
  return { route, catalog: pageNeedsCatalog(route) ? catalog : null };
}
