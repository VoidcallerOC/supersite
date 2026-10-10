import { describe, expect, it } from "vitest";
import lantern from "../../sites/lantern/site.config";
import { buildRoutes, routeMeta } from "../../src/core/routes";
import { loadCatalog } from "../../src/integrations/catalog/load";

describe("routes", async () => {
  const catalog = await loadCatalog(lantern.catalog!.provider);
  const routes = buildRoutes(lantern, catalog);

  it("generates page, product, event, post and 404 routes", () => {
    const kinds = routes.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.kind]: (acc[r.kind] ?? 0) + 1 }), {});
    expect(kinds).toEqual({ page: 5, product: 11, event: 6, post: 3, "not-found": 1 });
  });

  it("detail pages get breadcrumbs through their listing page", () => {
    const product = routes.find((r) => r.path === "/shop/ember-warden-holo/")!;
    expect(routeMeta(lantern, product).breadcrumbs.map((c) => c.path)).toEqual(["/", "/shop/", "/shop/ember-warden-holo/"]);
  });

  it("an unavailable catalog produces no product pages (the shop page shows the unavailable state instead)", () => {
    const r = buildRoutes(lantern, { status: "unavailable", reason: "down" });
    expect(r.some((x) => x.kind === "product")).toBe(false);
    expect(r.some((x) => x.path === "/shop/")).toBe(true);
  });
});
