import type { Product } from "../../core/schema";

/** Browser-safe catalog helpers (no validation library). */
export type CatalogFilter = { category: string; q: string; inStock: boolean };

export function filterProducts(items: Product[], f: CatalogFilter): Product[] {
  const q = f.q.trim().toLowerCase();
  return items.filter(
    (p) =>
      (f.category === "all" || p.category === f.category) &&
      (!f.inStock || (p.quantity ?? 0) > 0) &&
      (!q || `${p.name} ${p.summary} ${p.condition ?? ""}`.toLowerCase().includes(q)),
  );
}

export function stockLabel(quantity: number | null): { label: string; tone: "ok" | "low" | "out" | "unknown" } {
  if (quantity === null) return { label: "Ask in store", tone: "unknown" };
  if (quantity === 0) return { label: "Sold out", tone: "out" };
  if (quantity <= 2) return { label: `Only ${quantity} left`, tone: "low" };
  return { label: "In stock", tone: "ok" };
}
