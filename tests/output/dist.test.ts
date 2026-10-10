import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { spawnSync } from "node:child_process";

/**
 * Inspects the real build output in dist/ (run `npm run build:all` first).
 * These are the checks a reviewer would otherwise do by hand.
 */
const root = resolve(import.meta.dirname, "../..");
const SITES = { harborline: "Harborline", lantern: "Lantern & Lair", tallyhook: "Tallyhook" } as const;
type Id = keyof typeof SITES;

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === "assets" ? [] : htmlFiles(p);
    return f.endsWith(".html") ? [p] : [];
  });
}
const read = (p: string) => readFileSync(p, "utf8");
const attr = (html: string, re: RegExp) => html.match(re)?.[1];

for (const id of Object.keys(SITES) as Id[]) {
  const dir = join(root, "dist", id);
  describe(`dist/${id}`, () => {
    it("exists", () => expect(existsSync(join(dir, "index.html"))).toBe(true));
    const files = existsSync(dir) ? htmlFiles(dir) : [];
    const pages = files.map((f) => ({ f: f.slice(dir.length), html: read(f) }));

    it("every page has a unique <title>, a description and is noindex (demo)", () => {
      const titles = pages.map((p) => attr(p.html, /<title>([^<]+)<\/title>/));
      expect(titles.every(Boolean)).toBe(true);
      expect(new Set(titles).size).toBe(titles.length);
      for (const p of pages) {
        expect(p.html, p.f).toMatch(/<meta name="description" content="[^"]{20,}">/);
        expect(p.html, p.f).toContain('<meta name="robots" content="noindex, nofollow">');
        expect(p.html, p.f).not.toContain('rel="canonical"');
        expect(p.html, p.f).not.toContain("application/ld+json");
      }
    });

    it("content is in the HTML, not rendered only by JavaScript", () => {
      for (const p of pages) {
        const body = p.html.split('<div id="root">')[1] ?? "";
        expect(body.length, p.f).toBeGreaterThan(2000);
        expect(body, p.f).toMatch(/<h1[\s>]/);
      }
    });

    it("hydration data is valid JSON and cannot close its script tag", () => {
      for (const p of pages) {
        const json = attr(p.html, /<script type="application\/json" id="__page">([\s\S]*?)<\/script>/);
        expect(() => JSON.parse(json!), p.f).not.toThrow();
      }
    });

    it("every internal link and #anchor resolves", () => {
      const ids = (html: string) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
      const broken: string[] = [];
      for (const p of pages) {
        for (const [, href] of p.html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
          if (/^(https?:|mailto:|tel:)/.test(href)) continue;
          const [path, hash] = href.split("#");
          const targetHtml =
            path === ""
              ? p.html
              : (() => {
                  const file = join(dir, path, path.endsWith("/") ? "index.html" : "");
                  return existsSync(file) ? read(file) : null;
                })();
          if (targetHtml === null) broken.push(`${p.f} → ${href} (missing page)`);
          else if (hash && !ids(targetHtml).has(hash)) broken.push(`${p.f} → ${href} (missing #${hash})`);
        }
      }
      expect(broken).toEqual([]);
    });

    it("demo values are never linked (no tel:, mailto: or maps links to fictional facts)", () => {
      for (const p of pages) expect(p.html, p.f).not.toMatch(/href="(tel:|mailto:|https:\/\/www\.google\.com\/maps)/);
    });

    it("contains no other example site's content (isolation)", () => {
      const others = (Object.keys(SITES) as Id[]).filter((o) => o !== id).map((o) => SITES[o]);
      const assets = readdirSync(join(dir, "assets")).map((a) => read(join(dir, "assets", a)));
      for (const text of [...pages.map((p) => p.html), ...assets]) for (const o of others) expect(text.includes(o)).toBe(false);
    });

    it("ships crawl blocks: robots Disallow, no sitemap, X-Robots-Tag header", () => {
      expect(read(join(dir, "robots.txt"))).toContain("Disallow: /");
      expect(existsSync(join(dir, "sitemap.xml"))).toBe(false);
      const vercel = JSON.parse(read(join(dir, "vercel.json")));
      const headers = vercel.headers[0].headers.map((h: { key: string }) => h.key);
      expect(headers).toEqual(expect.arrayContaining(["Content-Security-Policy", "X-Robots-Tag", "X-Content-Type-Options"]));
    });

    it("has a 404 page", () => {
      expect(read(join(dir, "404.html"))).toContain("We can&#x27;t find that page".replace("&#x27;", "’"));
    });

    it("stays within the performance budget (JS ≤ 95 KB gzip, CSS ≤ 15 KB gzip, no zod in the client)", () => {
      const assets = readdirSync(join(dir, "assets"));
      const gz = (ext: string) => assets.filter((a) => a.endsWith(ext)).reduce((n, a) => n + gzipSync(readFileSync(join(dir, "assets", a))).length, 0);
      expect(gz(".js")).toBeLessThanOrEqual(95 * 1024);
      expect(gz(".css")).toBeLessThanOrEqual(15 * 1024);
      for (const a of assets.filter((x) => x.endsWith(".js"))) expect(read(join(dir, "assets", a))).not.toMatch(/ZodError|\$ZodType/);
    });
  });
}

describe("cross-site", () => {
  it("each site gets its own theme stylesheet", () => {
    const themes = (Object.keys(SITES) as Id[]).map((id) => readdirSync(join(root, "dist", id, "assets")).find((a) => a.startsWith("theme-")));
    expect(new Set(themes).size).toBe(3);
  });

  it("the SEO report shows structured data withheld until facts are confirmed", () => {
    const report = JSON.parse(read(join(root, "dist", "_reports", "harborline.json")));
    const home = report.routes.find((r: { path: string }) => r.path === "/");
    expect(home.emittedStructuredData).toEqual([]);
    expect(home.structuredDataOnceConfirmed[0]["@type"]).toBe("Plumber");
  });

  it("a production build of a demo site is refused by the launch gate", () => {
    const before = read(join(root, "dist", "tallyhook", "index.html"));
    const r = spawnSync(process.execPath, ["scripts/build.mjs", "--site", "tallyhook", "--production"], { cwd: root, encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/Launch gate failed for "tallyhook"[\s\S]*site\.demo is true[\s\S]*business\.appUrl is demo content/);
    // The refused build must not touch the existing output.
    expect(read(join(root, "dist", "tallyhook", "index.html"))).toBe(before);
  });

  it.each([
    [["--site", "lantern", "--deploy-dir", "../outside"], /must be a folder inside dist\//],
    [["--site", "lantern", "--deploy-dir", "dist"], /must be a folder inside dist\//],
    [["--site", "lantern", "--deploy-dir", "dist/lantern"], /exactly one site/],
    [["--all", "--deploy-dir", "dist/deploy"], /exactly one site/],
  ])("--deploy-dir refuses unsafe targets before building: %j", (args, message) => {
    const before = read(join(root, "dist", "lantern", "index.html"));
    const r = spawnSync(process.execPath, ["scripts/build.mjs", ...args], { cwd: root, encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(message);
    expect(read(join(root, "dist", "lantern", "index.html"))).toBe(before);
    expect(existsSync(resolve(root, "../outside"))).toBe(false);
  });
});
