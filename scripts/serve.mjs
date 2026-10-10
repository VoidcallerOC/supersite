#!/usr/bin/env node
/**
 * Minimal static server for previewing a built site (and for e2e tests).
 *   node scripts/serve.mjs --site lantern --port 4173
 * Serves dist/<site> only, on 127.0.0.1. No writes.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const site = arg("--site", process.env.SITE ?? "harborline");
const port = Number(arg("--port", "4173"));
const base = join(root, "dist", site);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
};

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  let file = join(base, p);
  if (!file.startsWith(base)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const s = await stat(file);
    if (s.isDirectory()) file = join(file, "index.html");
    else if (!extname(file)) throw new Error("no ext");
    const body = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    if (!p.endsWith("/") && !extname(p)) {
      res.writeHead(308, { location: `${p}/${url.search}` }).end();
      return;
    }
    const body = await readFile(join(base, "404.html")).catch(() => "Not found");
    res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end(body);
  }
}).listen(port, "127.0.0.1", () => console.log(`Serving dist/${site} at http://127.0.0.1:${port}`));
