import { describe, expect, it } from "vitest";
import harborline from "../../sites/harborline/site.config";
import lantern from "../../sites/lantern/site.config";
import tallyhook from "../../sites/tallyhook/site.config";
import { defineSite } from "../../src/core/define-site";
import { contrastChecks } from "../../src/core/contrast";
import type { SiteConfigInput } from "../../src/core/schema";

const sites = [harborline, lantern, tallyhook];

describe("example site configs", () => {
  it("all validate and cover three different site families", () => {
    expect(sites.map((s) => s.family)).toEqual(["local-service", "retail-hobby", "product"]);
  });

  it.each(sites.map((s) => [s.id, s] as const))("%s: every text color pair meets WCAG contrast minimums", (_id, site) => {
    const failures = contrastChecks(site.theme).filter((c) => c.ratio < c.min);
    expect(failures).toEqual([]);
  });

  it("themes are genuinely distinct, not accent swaps", () => {
    const sig = (s: (typeof sites)[number]) =>
      [s.theme.colorScheme, s.theme.fonts.heading, s.theme.headingCase, s.theme.shadow, s.theme.density, s.theme.radius.md, s.header.variant].join("|");
    expect(new Set(sites.map(sig)).size).toBe(3);
    for (const a of sites)
      for (const b of sites)
        if (a !== b)
          expect(
            sig(a)
              .split("|")
              .filter((x, i) => x !== sig(b).split("|")[i]).length,
          ).toBeGreaterThanOrEqual(4);
  });

  it("every fact in the demos is labelled demo content", () => {
    for (const s of sites) {
      const facts = [
        s.business.phone,
        s.business.email,
        s.business.address,
        s.business.hours,
        s.business.serviceArea,
        s.business.appUrl,
        ...s.business.social.map((x) => x.href),
      ].filter(Boolean);
      expect(facts.length).toBeGreaterThan(0);
      for (const f of facts) expect(f!.status).toBe("demo");
    }
  });
});

describe("schema guards against fabrication and broken config", () => {
  const base = () => structuredClone(harborline) as unknown as SiteConfigInput;

  it("rejects a testimonial without a source and permission", () => {
    const cfg = base();
    cfg.pages![0].sections.push({
      type: "testimonials",
      id: "fake",
      heading: "Reviews",
      items: [{ quote: "Best plumber ever, ten stars!", author: "A. Customer" }],
    } as never);
    expect(() => defineSite(cfg)).toThrow(/items\.0\.(source|permission)/);
  });

  it("rejects duplicate section ids and missing form config", () => {
    const cfg = base();
    cfg.pages![1].sections.push({ type: "contact", id: "repairs", heading: "x", form: "nope" } as never);
    expect(() => defineSite(cfg)).toThrow(/duplicate section id "repairs"[\s\S]*form "nope" is not configured/);
  });

  it("requires an h1 source on pages that do not start with a hero", () => {
    const cfg = base();
    delete (cfg.pages![1] as { heading?: string }).heading;
    expect(() => defineSite(cfg)).toThrow(/\/services\/: needs a "heading"/);
  });

  it("rejects duplicate page titles and over-long descriptions", () => {
    const cfg = base();
    cfg.pages![2].title = cfg.pages![1].title;
    expect(() => defineSite(cfg)).toThrow(/share the title/);
    const cfg2 = base();
    cfg2.pages![1].description = "x".repeat(200);
    expect(() => defineSite(cfg2)).toThrow(/description/);
  });

  it("rejects non-hex theme colors so contrast can always be checked", () => {
    const cfg = base();
    cfg.theme!.colors.accent = "teal";
    expect(() => defineSite(cfg)).toThrow(/theme\.colors\.accent/);
  });
});
