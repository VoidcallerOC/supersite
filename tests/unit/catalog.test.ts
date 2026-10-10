import { describe, expect, it, vi } from "vitest";
import { filterProducts, loadCatalog, normalizeProducts, stockLabel } from "../../src/integrations/catalog/load";
import { LANTERN_FIXTURE } from "../../sites/lantern/catalog.fixture";

describe("catalog provider", () => {
  it("fixture: drops invalid items and reports why", async () => {
    const r = await loadCatalog({ provider: "fixture", items: LANTERN_FIXTURE, label: "x" });
    expect(r.status).toBe("ok");
    if (r.status !== "ok") return;
    expect(r.data).toHaveLength(LANTERN_FIXTURE.length - 1);
    expect(r.warnings[0]).toMatch(/item 11 dropped: priceCents/);
  });

  it("none and empty fixture are 'empty', not errors", async () => {
    expect((await loadCatalog({ provider: "none" })).status).toBe("empty");
    expect((await loadCatalog({ provider: "fixture", items: [], label: "x" })).status).toBe("empty");
  });

  it("drops duplicate slugs", () => {
    const item = { slug: "a", name: "A", category: "c", priceCents: 1, quantity: 1, summary: "s" };
    expect(normalizeProducts([item, item]).warnings[0]).toMatch(/duplicate slug a/);
  });

  const http = { provider: "http" as const, url: "https://inventory.test/items", timeoutMs: 50 };

  it("http: ok with { items } shape", async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ items: LANTERN_FIXTURE.slice(0, 2) }) });
    const r = await loadCatalog(http, { fetch });
    expect(r.status).toBe("ok");
    expect(fetch).toHaveBeenCalledWith("https://inventory.test/items", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it.each([
    ["HTTP error", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }), /responded 503/],
    ["network error", vi.fn().mockRejectedValue(new TypeError("fetch failed")), /could not be reached/],
    ["bad shape", vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ nope: 1 }) }), /unexpected shape/],
  ])("http: %s degrades to unavailable", async (_n, fetch, reason) => {
    const r = await loadCatalog(http, { fetch });
    expect(r).toMatchObject({ status: "unavailable", reason: expect.stringMatching(reason) });
  });

  it("http: timeout degrades to unavailable", async () => {
    const fetch = (_u: string, init?: { signal?: AbortSignal }) =>
      new Promise<never>((_res, rej) => init?.signal?.addEventListener("abort", () => rej(Object.assign(new Error("aborted"), { name: "AbortError" }))));
    expect(await loadCatalog(http, { fetch })).toMatchObject({ status: "unavailable", reason: "Catalog source timed out after 50ms" });
  });
});

describe("catalog view helpers", () => {
  const items = normalizeProducts(LANTERN_FIXTURE).items;
  it("filters by category, stock and text", () => {
    expect(filterProducts(items, { category: "singles", q: "", inStock: false })).toHaveLength(3);
    expect(filterProducts(items, { category: "singles", q: "", inStock: true })).toHaveLength(2);
    expect(filterProducts(items, { category: "all", q: "harbor", inStock: false }).map((p) => p.slug)).toEqual(["harbor-lights-board-game"]);
  });
  it("never guesses stock", () => {
    expect(stockLabel(null).label).toBe("Ask in store");
    expect(stockLabel(0).label).toBe("Sold out");
    expect(stockLabel(2).label).toBe("Only 2 left");
  });
});
