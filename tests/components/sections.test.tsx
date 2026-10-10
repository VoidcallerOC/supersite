// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { Catalog } from "../../src/sections/Catalog";
import { Testimonials } from "../../src/sections/Testimonials";
import { App } from "../../src/App";
import lantern from "../../sites/lantern/site.config";
import harborline from "../../sites/harborline/site.config";
import tallyhook from "../../sites/tallyhook/site.config";
import { loadCatalog } from "../../src/integrations/catalog/load";
import { buildRoutes, pageNeedsCatalog } from "../../src/core/routes";
import { liveVariant } from "../fixtures/live-site";
import { renderWithSite } from "./helpers";
import type { SectionOf } from "../../src/core/schema";

afterEach(cleanup);

const catalogSection = lantern.pages.find((p) => p.path === "/shop/")!.sections[0] as SectionOf<"catalog">;

describe("Catalog section", async () => {
  const catalog = await loadCatalog(lantern.catalog!.provider);

  it("filters by category and announces the result count", async () => {
    const user = userEvent.setup();
    renderWithSite(lantern, <Catalog section={catalogSection} catalog={catalog} isFirst={false} />);
    expect(screen.getByText("Showing 11 of 11 products")).toBeTruthy();
    await user.selectOptions(screen.getByLabelText("Category"), "singles");
    expect(screen.getByText("Showing 3 of 11 products")).toBeTruthy();
    expect(window.location.search).toBe("?category=singles");
    await user.click(screen.getByLabelText("In stock only"));
    expect(screen.getByText("Showing 2 of 11 products")).toBeTruthy();
  });

  it("labels fixture data as a sample", () => {
    renderWithSite(lantern, <Catalog section={catalogSection} catalog={catalog} isFirst={false} />);
    expect(screen.getByText("Sample inventory — not real stock")).toBeTruthy();
  });

  it("unavailable provider: renders an alert instead of an empty shop", () => {
    renderWithSite(lantern, <Catalog section={catalogSection} catalog={{ status: "unavailable", reason: "down" }} isFirst={false} />);
    expect(screen.getByRole("alert").textContent).toMatch(/Inventory is unavailable/);
  });

  it("empty provider: renders an honest empty state", () => {
    renderWithSite(lantern, <Catalog section={catalogSection} catalog={{ status: "empty", warnings: [] }} isFirst={false} />);
    expect(screen.getByRole("status").textContent).toMatch(/No products listed yet/);
  });
});

describe("Testimonials never invent reviews", () => {
  const section = { type: "testimonials", id: "r", heading: "Reviews", items: [], hidden: false, tone: "default" } as SectionOf<"testimonials">;
  it("demo with none: shows a placeholder explaining why", () => {
    renderWithSite(harborline, <Testimonials section={section} catalog={null} isFirst={false} />);
    expect(screen.getByText(/does not invent testimonials/)).toBeTruthy();
  });
  it("live with none: renders nothing", () => {
    const { container } = renderWithSite(liveVariant(), <Testimonials section={section} catalog={null} isFirst={false} />);
    expect(container.innerHTML).toBe("");
  });
});

describe("Every prerendered route", () => {
  it("has exactly one h1, a main landmark and a skip link", async () => {
    for (const site of [harborline, lantern, tallyhook]) {
      const catalog = site.catalog ? await loadCatalog(site.catalog.provider) : { status: "empty" as const, warnings: [] };
      for (const route of buildRoutes(site, catalog)) {
        const html = renderToString(<App site={site} props={{ route, catalog: pageNeedsCatalog(route) ? catalog : null }} />);
        const h1 = html.match(/<h1[\s>]/g) ?? [];
        expect(h1.length, `${site.id} ${route.path}`).toBe(1);
        expect(html).toContain('<main id="main"');
        expect(html).toContain('href="#main"');
      }
    }
  });
});
