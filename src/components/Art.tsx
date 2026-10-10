/**
 * Decorative, generated artwork. No stock photos and no other clients'
 * imagery: replace with owner-supplied photos (with alt text) when available.
 * Everything here is aria-hidden.
 */
export function HeroArt({ kind }: { kind: "none" | "grid" | "rings" | "product-mock" }) {
  if (kind === "none") return null;
  if (kind === "grid")
    return (
      <svg aria-hidden="true" viewBox="0 0 400 300" className="h-auto w-full text-accent" focusable="false">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="currentColor" strokeOpacity="0.25" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#g)" />
        <rect x="60" y="60" width="140" height="180" rx="10" fill="currentColor" fillOpacity="0.9" />
        <rect x="220" y="100" width="120" height="140" rx="10" fill="none" stroke="currentColor" strokeWidth="6" />
      </svg>
    );
  if (kind === "rings")
    return (
      <svg aria-hidden="true" viewBox="0 0 400 400" className="h-auto w-full text-accent" focusable="false">
        {[180, 140, 100, 60].map((r, i) => (
          <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeWidth={i === 3 ? 18 : 3} strokeOpacity={0.25 + i * 0.2} />
        ))}
      </svg>
    );
  return <ProductMock />;
}

/** A product screenshot built from markup, so it stays sharp, themed and honest (no fake metrics). */
function ProductMock() {
  const rows = [
    ["INV-1042", "Draft", "w-24"],
    ["INV-1041", "Sent", "w-16"],
    ["INV-1040", "Paid", "w-20"],
    ["INV-1039", "Paid", "w-12"],
  ];
  return (
    <div aria-hidden="true" className="card overflow-hidden text-left text-sm">
      <div className="flex items-center gap-1.5 border-b border-border bg-surface-alt px-4 py-3">
        <span className="size-2.5 rounded-pill bg-border" />
        <span className="size-2.5 rounded-pill bg-border" />
        <span className="size-2.5 rounded-pill bg-border" />
        <span className="ml-3 text-xs text-muted">Sample workspace</span>
      </div>
      <div className="grid gap-0 sm:grid-cols-[9rem_1fr]">
        <div className="hidden space-y-2 border-r border-border p-4 sm:block">
          {["Invoices", "Clients", "Reminders", "Settings"].map((x, i) => (
            <div key={x} className={`rounded-sm px-2 py-1 ${i === 0 ? "bg-accent text-accent-ink" : "text-muted"}`}>
              {x}
            </div>
          ))}
        </div>
        <ul className="divide-y divide-border">
          {rows.map(([id, status, w]) => (
            <li key={id} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-label">{id}</span>
              <span className={`h-2 rounded-pill bg-border ${w}`} />
              <span className="tag">{status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const PRODUCT_GLYPH: Record<string, string> = {
  card: "M30 18h40v64H30z",
  box: "M20 35l30-15 30 15v35L50 85 20 70z",
  dice: "M50 15l30 17v36L50 85 20 68V32z",
  book: "M25 20h28c5 0 7 3 7 7v58c0-4-3-6-7-6H25z M60 27c0-4 2-7 7-7h8v59h-8c-4 0-7 2-7 6",
  paint: "M40 15h20v20l10 10v40H30V45l10-10z",
};

export function ProductArt({ art, label }: { art: string; label: string }) {
  const d = PRODUCT_GLYPH[art] ?? PRODUCT_GLYPH.card;
  return (
    <div aria-hidden="true" className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-surface-alt text-accent">
      <svg viewBox="0 0 100 100" className="h-1/2 w-1/2" focusable="false">
        <path d={d} fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <span className="absolute right-2 bottom-2 text-[0.625rem] tracking-wider text-muted uppercase">{label}</span>
    </div>
  );
}
