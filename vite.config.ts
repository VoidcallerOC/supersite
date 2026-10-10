import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * `virtual:site` resolves to exactly one site's config, chosen by the SITE
 * environment variable. Each build therefore contains one client's content
 * only, so one site's customisation cannot leak into another's bundle.
 */
function siteConfigPlugin(siteId: string): Plugin {
  const file = resolve(import.meta.dirname, "sites", siteId, "site.config.ts");
  if (!existsSync(file)) throw new Error(`No site config at sites/${siteId}/site.config.ts`);
  // Production client builds get the config pre-validated as JSON by scripts/build.mjs.
  const json = process.env.SITE_CONFIG_JSON;
  return {
    name: "forge-site-config",
    resolveId(id) {
      if (id !== "virtual:site") return null;
      return json ? "\0virtual:site" : file;
    },
    load(id) {
      if (id === "\0virtual:site" && json) return `export default JSON.parse(${JSON.stringify(readFileSync(json, "utf8"))});`;
      return null;
    },
  };
}

export default defineConfig(() => {
  const siteId = process.env.SITE ?? "harborline";
  return {
    plugins: [siteConfigPlugin(siteId), react(), tailwindcss()],
    build: {
      outDir: `dist/${siteId}`,
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});
