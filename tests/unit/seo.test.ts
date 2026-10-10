import { describe, expect, it } from "vitest";
import harborline from "../../sites/harborline/site.config";
import lantern from "../../sites/lantern/site.config";
import tallyhook from "../../sites/tallyhook/site.config";
import { headTags, isIndexable, launchProblems, robotsTxt, safeJson, sitemapXml, structuredData } from "../../src/core/seo";
import { buildRoutes, routeMeta } from "../../src/core/routes";
import { liveVariant } from "../fixtures/live-site";
import { ok } from "../../src/integrations/result";

const home = (s: typeof harborline) => buildRoutes(s, { status: "empty", warnings: [] })[0];

describe("indexing is opt-in", () => {
  const live = liveVariant();
  it("only a production build of a non-demo site with an origin is indexable", () => {
    expect(isIndexable(live, { production: true })).toBe(true);
    expect(isIndexable(live, { production: false })).toBe(false);
    expect(isIndexable(harborline, { production: true })).toBe(false);
    expect(isIndexable(liveVariant({ origin: undefined }), { production: true })).toBe(false);
  });

  it("404 is never indexable", () => {
    const nf = buildRoutes(live, { status: "empty", warnings: [] }).find((r) => r.kind === "not-found")!;
    expect(isIndexable(live, { production: true }, nf)).toBe(false);
  });

  it("robots and sitemap follow the same decision", () => {
    expect(robotsTxt(harborline, { production: true })).toContain("Disallow: /");
    expect(sitemapXml(harborline, [home(harborline)], { production: true })).toBeNull();
    expect(robotsTxt(live, { production: true })).toContain("Sitemap: https://harborline.test/sitemap.xml");
    expect(sitemapXml(live, buildRoutes(live, { status: "empty", warnings: [] }), { production: true })).toContain(
      "<loc>https://harborline.test/services/</loc>",
    );
  });
});

describe("structured data", () => {
  it("demo sites emit none", () => {
    for (const s of [harborline, lantern, tallyhook])
      for (const r of buildRoutes(s, { status: "empty", warnings: [] })) expect(structuredData(s, r)).toEqual([]);
  });

  it("preview shows what will be emitted once facts are confirmed", () => {
    const nodes = structuredData(harborline, home(harborline), { preview: true });
    expect(nodes[0]).toMatchObject({ "@type": "Plumber", telephone: "(555) 010-0142" });
  });

  it("a live site emits LocalBusiness from confirmed facts, with hours from the single source", () => {
    const live = liveVariant();
    const [biz] = structuredData(live, home(live));
    expect(biz).toMatchObject({ "@type": "Plumber", url: "https://harborline.test", telephone: "(555) 010-0142" });
    expect((biz.openingHoursSpecification as unknown[]).length).toBe(6);
  });

  it("unconfirmed facts are left out of a live site's structured data", () => {
    const live = liveVariant();
    const withUnconfirmedPhone = { ...live, business: { ...live.business, phone: { ...live.business.phone!, status: "unconfirmed" as const } } };
    const [biz] = structuredData(withUnconfirmedPhone, home(withUnconfirmedPhone));
    expect(biz.telephone).toBeUndefined();
  });

  it("no LocalBusiness without a confirmed address", () => {
    const live = liveVariant();
    const noAddr = { ...live, business: { ...live.business, address: undefined } };
    expect(structuredData(noAddr, home(noAddr)).find((n) => n["@type"] === "Plumber")).toBeUndefined();
  });

  it("JSON-LD cannot break out of its script tag", () => {
    expect(safeJson({ x: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

describe("head tags", () => {
  it("demo pages are noindex and have no canonical without an origin", () => {
    const head = headTags(harborline, home(harborline), { production: false });
    expect(head).toContain('content="noindex, nofollow"');
    expect(head).not.toContain('rel="canonical"');
    expect(head).not.toContain("ld+json");
  });

  it("live pages get canonical, og:url and escaped titles", () => {
    const live = liveVariant();
    const head = headTags(live, home(live), { production: true });
    expect(head).toContain('<link rel="canonical" href="https://harborline.test/">');
    expect(head).toContain('content="index, follow"');
    expect(head).toContain("&amp;");
  });

  it("every route in every example has a unique title", () => {
    const catalog =
      lantern.catalog?.provider.provider === "fixture"
        ? ok(lantern.catalog.provider.items.filter((x) => (x as { priceCents?: number }).priceCents !== undefined) as never)
        : ok([]);
    for (const s of [harborline, lantern, tallyhook]) {
      const titles = buildRoutes(s, catalog as never).map((r) => routeMeta(s, r).title);
      expect(new Set(titles).size).toBe(titles.length);
    }
  });
});

describe("launch gate", () => {
  it("blocks every demo from a production build, with reasons", () => {
    expect(launchProblems(harborline)).toEqual(
      expect.arrayContaining(["site.demo is true", "business.phone is demo content", 'form "contact" uses the demo provider and sends nothing']),
    );
    expect(launchProblems(lantern)).toContain("catalog uses fixture (sample) data");
    expect(launchProblems(tallyhook)).toContain("business.appUrl is demo content");
  });

  it("passes for a fully confirmed live site", () => {
    expect(launchProblems(liveVariant())).toEqual([]);
  });
});
