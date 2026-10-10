import { useId, useMemo, useState } from "react";
import { useLocationSearch } from "../components/client-state";
import type { SectionProps } from "./types";
import { SectionShell, StatusMessage } from "../components/ui";
import { useSite } from "../components/site-context";
import { ProductArt } from "../components/Art";
import { filterProducts, stockLabel, type CatalogFilter } from "../integrations/catalog/view";
import { formatCents } from "../core/money";
import { track } from "../integrations/analytics";
import type { Product } from "../core/schema";

const DEFAULT_FILTER: CatalogFilter = { category: "all", q: "", inStock: false };

function parseFilter(search: string): CatalogFilter {
  const p = new URLSearchParams(search);
  return { category: p.get("category") ?? "all", q: p.get("q") ?? "", inStock: p.get("stock") === "1" };
}

export function Catalog({ section: s, catalog }: SectionProps<"catalog">) {
  const site = useSite();
  const cfg = site.catalog!;
  const uid = useId();
  // Filters live in the URL so results can be shared. The URL is read only in
  // the browser, so the prerendered HTML (full list) and hydration match.
  const search = useLocationSearch();
  const fromUrl = useMemo(() => (s.filters ? parseFilter(search) : DEFAULT_FILTER), [search, s.filters]);
  const [edited, setEdited] = useState<CatalogFilter | null>(null);
  const filter = edited ?? fromUrl;

  function update(next: CatalogFilter) {
    setEdited(next);
    const p = new URLSearchParams();
    if (next.category !== "all") p.set("category", next.category);
    if (next.q) p.set("q", next.q);
    if (next.inStock) p.set("stock", "1");
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
    track({ name: "catalog_filter", props: { category: next.category } });
  }

  const all = useMemo(() => (catalog?.status === "ok" ? catalog.data : []), [catalog]);
  const results = useMemo(() => {
    const list = s.filters ? filterProducts(all, filter) : all;
    return s.limit ? list.slice(0, s.limit) : list;
  }, [all, filter, s.filters, s.limit]);

  const sample = cfg.provider.provider === "fixture" ? cfg.provider.label : null;

  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro}>
      {sample && catalog?.status === "ok" ? <p className="tag mb-6">{sample}</p> : null}

      {!catalog || catalog.status === "unavailable" ? (
        <StatusMessage kind="error" title="Inventory is unavailable right now">
          We could not load the product list. Nothing is wrong with your connection — please check back later or contact the store.
        </StatusMessage>
      ) : catalog.status === "empty" ? (
        <StatusMessage kind="empty" title="No products listed yet">
          The online catalog is empty. Visit or contact the store for what is in stock today.
        </StatusMessage>
      ) : (
        <>
          {s.filters ? (
            <form
              role="search"
              aria-label="Filter products"
              className="mb-8 grid gap-4 sm:grid-cols-[2fr_1.2fr_auto] sm:items-end"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label htmlFor={`${uid}-q`} className="field-label">
                  Search
                </label>
                <input
                  id={`${uid}-q`}
                  type="search"
                  className="field-input"
                  value={filter.q}
                  onChange={(e) => update({ ...filter, q: e.target.value })}
                  placeholder="Name or keyword"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-cat`} className="field-label">
                  Category
                </label>
                <select id={`${uid}-cat`} className="field-input" value={filter.category} onChange={(e) => update({ ...filter, category: e.target.value })}>
                  <option value="all">All categories</option>
                  {cfg.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex min-h-11 items-center gap-2 font-semibold">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--c-accent)]"
                  checked={filter.inStock}
                  onChange={(e) => update({ ...filter, inStock: e.target.checked })}
                />
                In stock only
              </label>
            </form>
          ) : null}

          <p role="status" aria-live="polite" className="mb-4 text-sm text-muted">
            {s.filters ? `Showing ${results.length} of ${all.length} products` : ""}
          </p>

          {results.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((p) => (
                <ProductCard
                  key={p.slug}
                  p={p}
                  basePath={cfg.basePath}
                  currency={cfg.currency}
                  categoryLabel={cfg.categories.find((c) => c.id === p.category)?.label ?? p.category}
                />
              ))}
            </ul>
          ) : (
            <StatusMessage kind="empty" title="No products match these filters">
              <button type="button" className="btn btn-ghost px-0" onClick={() => update(DEFAULT_FILTER)}>
                Clear all filters
              </button>
            </StatusMessage>
          )}

          {s.viewAllHref ? (
            <p className="mt-8">
              <a className="btn btn-secondary" href={s.viewAllHref}>
                View the full catalog
              </a>
            </p>
          ) : null}
        </>
      )}
    </SectionShell>
  );
}

function ProductCard({ p, basePath, currency, categoryLabel }: { p: Product; basePath: string; currency: string; categoryLabel: string }) {
  const stock = stockLabel(p.quantity);
  return (
    <li className="card relative flex flex-col overflow-hidden p-3 text-ink">
      {p.image ? (
        <img
          src={p.image.src}
          alt={p.image.alt}
          width={p.image.width}
          height={p.image.height}
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full rounded-md object-cover"
        />
      ) : (
        <ProductArt art={p.art} label="Photo soon" />
      )}
      <div className="flex flex-1 flex-col px-1 pt-3">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">{categoryLabel}</p>
        <h3 className="mt-1 text-base">
          <a href={`${basePath}${p.slug}/`} className="no-underline after:absolute after:inset-0 hover:underline">
            {p.name}
          </a>
        </h3>
        {p.condition ? <p className="text-sm text-muted">{p.condition}</p> : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="font-label text-lg font-bold">{formatCents(p.priceCents, currency)}</span>
          <span className={`tag ${stock.tone === "out" ? "text-danger" : stock.tone === "ok" ? "text-success" : ""}`}>{stock.label}</span>
        </div>
      </div>
    </li>
  );
}
