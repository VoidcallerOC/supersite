import type { SectionProps } from "./types";
import { CtaLink, SectionShell } from "../components/ui";
import { formatCents } from "../core/money";

export function Pricing({ section: s }: SectionProps<"pricing">) {
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro} align="center">
      <ul className="grid items-stretch gap-6 md:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]">
        {s.plans.map((p) => (
          <li key={p.name} className={`card flex flex-col p-7 text-ink ${p.featured ? "ring-2 ring-accent" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h3>{p.name}</h3>
              {p.featured ? <span className="tag text-ink">Most popular</span> : null}
            </div>
            <p className="mt-2 text-muted">{p.summary}</p>
            <p className="mt-6">
              {p.priceCents === null ? (
                <span className="text-3xl font-black">Custom</span>
              ) : (
                <>
                  <span className="text-4xl font-black">{formatCents(p.priceCents)}</span>
                  {p.period ? <span className="text-muted"> / {p.period}</span> : null}
                </>
              )}
            </p>
            <ul className="mt-6 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span aria-hidden="true" className="font-bold text-success">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <CtaLink cta={{ ...p.cta, variant: p.featured ? "primary" : "secondary" }} className="w-full" />
            </div>
          </li>
        ))}
      </ul>
      {s.note ? <p className="mx-auto mt-8 max-w-2xl text-center text-sm opacity-80">{s.note}</p> : null}
    </SectionShell>
  );
}
