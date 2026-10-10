import { product, type CatalogProviderConfig, type Product } from "../../core/schema";
import { empty, ok, unavailable, type ProviderResult } from "../result";

export type FetchLike = (url: string, init?: { signal?: AbortSignal }) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

/** Validate raw items one by one. Bad items are dropped and reported, never rendered half-broken. */
export function normalizeProducts(raw: unknown[]): { items: Product[]; warnings: string[] } {
  const items: Product[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();
  raw.forEach((r, i) => {
    const parsed = product.safeParse(r);
    if (!parsed.success) {
      warnings.push(`item ${i} dropped: ${parsed.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
      return;
    }
    if (seen.has(parsed.data.slug)) {
      warnings.push(`item ${i} dropped: duplicate slug ${parsed.data.slug}`);
      return;
    }
    seen.add(parsed.data.slug);
    items.push(parsed.data);
  });
  return { items, warnings };
}

/**
 * Load the catalog at build time. Credentials are never required: "none" and
 * "fixture" work offline, and "http" degrades to `unavailable` on any failure.
 */
export async function loadCatalog(config: CatalogProviderConfig | undefined, deps: { fetch?: FetchLike } = {}): Promise<ProviderResult<Product[]>> {
  if (!config || config.provider === "none") return empty();
  if (config.provider === "fixture") {
    const { items, warnings } = normalizeProducts(config.items);
    return items.length ? ok(items, warnings) : empty(warnings);
  }
  const doFetch = deps.fetch ?? (globalThis.fetch as unknown as FetchLike | undefined);
  if (!doFetch) return unavailable("No fetch implementation available");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const res = await doFetch(config.url, { signal: controller.signal });
    if (!res.ok) return unavailable(`Catalog source responded ${res.status}`);
    const body = await res.json();
    const list = Array.isArray(body) ? body : (body as { items?: unknown }).items;
    if (!Array.isArray(list)) return unavailable("Catalog source returned an unexpected shape");
    const { items, warnings } = normalizeProducts(list);
    return items.length ? ok(items, warnings) : empty(warnings);
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return unavailable(aborted ? `Catalog source timed out after ${config.timeoutMs}ms` : "Catalog source could not be reached");
  } finally {
    clearTimeout(timer);
  }
}

export { filterProducts, stockLabel, type CatalogFilter } from "./view";
