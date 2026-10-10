#!/usr/bin/env node
/**
 * Build one or all sites into dist/<site>/ as fully prerendered static HTML.
 *
 *   node scripts/build.mjs                 # SITE env var or "harborline"
 *   node scripts/build.mjs --site lantern
 *   node scripts/build.mjs --all
 *   node scripts/build.mjs --site x --production   # launch build: fails unless launch gate passes
 *   node scripts/build.mjs --site x --deploy-dir dist/deploy
 *       # also copy the finished site to a fixed folder a host can serve (e.g. Vercel's outputDirectory)
 *
 * Writes only inside this project (dist/). Makes no network requests unless a
 * site config explicitly uses the "http" catalog provider.
 */
import { build } from "vite";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const production = args.includes("--production");
const siteArg = args.includes("--site") ? args[args.indexOf("--site") + 1] : undefined;

const allSites = (await readdir(join(root, "sites"), { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
const sites = args.includes("--all") ? allSites : [siteArg ?? process.env.SITE ?? "harborline"];

// Optional fixed output folder for hosts that serve one directory. Single site
// only, and only inside dist/, so a typo can never delete anything else.
const deployArg = args.includes("--deploy-dir") ? args[args.indexOf("--deploy-dir") + 1] : undefined;
const deployDir = deployArg ? resolve(root, deployArg) : undefined;
if (deployDir) {
  const rel = relative(join(root, "dist"), deployDir);
  if (!rel || rel.startsWith("..") || resolve(join(root, "dist"), rel) !== deployDir) {
    console.error(`✗ --deploy-dir must be a folder inside dist/ (got ${deployArg})`);
    process.exit(1);
  }
  if (sites.length !== 1 || sites.includes(rel.split(/[\\/]/)[0])) {
    console.error("✗ --deploy-dir needs exactly one site and must not be that site's own dist folder");
    process.exit(1);
  }
}

const escAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
const jsonForScript = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

function securityHeaders(indexable) {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self' mailto:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");
  const headers = [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  ];
  if (!indexable) headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  return {
    cleanUrls: false,
    trailingSlash: true,
    headers: [
      { source: "/(.*)", headers },
      { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ],
  };
}

async function buildSite(siteId) {
  const started = Date.now();
  process.env.SITE = siteId;
  const outDir = join(root, "dist", siteId);
  const ssrDir = join(root, "dist", ".ssr", siteId);
  const quiet = { logLevel: "warn", configFile: join(root, "vite.config.ts"), root };

  // 1. Server bundle: validates the config (zod) and renders pages. Never shipped.
  delete process.env.SITE_CONFIG_JSON;
  await build({ ...quiet, build: { ssr: "src/entry-server.tsx", outDir: ssrDir, emptyOutDir: true } });
  const server = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href + `?t=${Date.now()}`);
  const env = { production };
  const prepared = await server.prepare(env);

  // Launch gate runs before anything is written to dist/<site>, so a refused
  // production build cannot leave a half-built site behind.
  if (production && prepared.launchProblems.length) {
    throw new Error(`Launch gate failed for "${siteId}":\n${prepared.launchProblems.map((p) => `  - ${p}`).join("\n")}`);
  }

  // 2. Client bundle: receives the validated config as JSON.
  const configJson = join(ssrDir, "site.client.json");
  await writeFile(configJson, JSON.stringify(server.clientSite()));
  process.env.SITE_CONFIG_JSON = configJson;
  await build({ ...quiet });
  delete process.env.SITE_CONFIG_JSON;
  if (prepared.catalog.status === "unavailable")
    console.warn(`[${siteId}] catalog unavailable: ${prepared.catalog.reason} (pages will show the unavailable state)`);
  for (const w of prepared.catalog.warnings ?? []) console.warn(`[${siteId}] catalog: ${w}`);

  const template = await readFile(join(outDir, "index.html"), "utf8");
  await rm(join(outDir, "index.html"));

  const themeHash = createHash("sha256").update(prepared.themeCss).digest("hex").slice(0, 10);
  const themeFile = `assets/theme-${themeHash}.css`;
  await writeFile(join(outDir, themeFile), prepared.themeCss);
  const themeLink = `<link rel="stylesheet" href="/${themeFile}">`;

  let pages = 0;
  for (const route of prepared.routes) {
    const { html, head, props } = server.render(route, prepared.catalog, env);
    const doc = template
      .replace('<html lang="en">', `<html lang="${escAttr(server.site.locale.split("-")[0])}">`)
      .replace("<!--head-->", `${themeLink}\n    ${head}`)
      .replace("<!--app-->", html)
      .replace("<!--data-->", `<script type="application/json" id="__page">${jsonForScript(props)}</script>`);
    const file = route.kind === "not-found" ? join(outDir, "404.html") : join(outDir, route.path, "index.html");
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, doc);
    pages++;
  }

  await writeFile(join(outDir, "robots.txt"), prepared.robots);
  if (prepared.sitemap) await writeFile(join(outDir, "sitemap.xml"), prepared.sitemap);
  const indexable = prepared.report.some((r) => r.indexable);
  await writeFile(join(outDir, "vercel.json"), JSON.stringify(securityHeaders(indexable), null, 2) + "\n");

  const reportDir = join(root, "dist", "_reports");
  await mkdir(reportDir, { recursive: true });
  await writeFile(
    join(reportDir, `${siteId}.json`),
    JSON.stringify(
      {
        site: siteId,
        production,
        demo: server.site.demo,
        indexable,
        catalog: prepared.catalog.status,
        launchProblems: prepared.launchProblems,
        routes: prepared.report,
      },
      null,
      2,
    ) + "\n",
  );

  console.log(`✓ ${siteId}: ${pages} pages → dist/${siteId} (${production ? "production" : "preview, noindex"}) in ${Date.now() - started}ms`);
  if (!production && prepared.launchProblems.length)
    console.log(`  launch gate (not enforced in preview): ${prepared.launchProblems.length} open item(s), see dist/_reports/${siteId}.json`);
}

let failed = false;
for (const s of sites) {
  try {
    await buildSite(s);
  } catch (err) {
    failed = true;
    console.error(`✗ ${s}: ${err instanceof Error ? err.message : err}`);
  }
}
await rm(join(root, "dist", ".ssr"), { recursive: true, force: true });
if (deployDir && !failed) {
  // Copied only after a fully successful build, so a failed build never replaces what is there.
  await rm(deployDir, { recursive: true, force: true });
  await cp(join(root, "dist", sites[0]), deployDir, { recursive: true });
  console.log(`✓ ${sites[0]} copied to ${relative(root, deployDir)}`);
}
process.exit(failed ? 1 : 0);
