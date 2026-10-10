import type { SectionProps } from "./types";
import { SectionShell } from "../components/ui";
import { useSite } from "../components/site-context";

/**
 * Real, permissioned reviews only (the schema requires source + permission).
 * With none configured: a live site renders nothing; a demo shows where
 * reviews will go instead of inventing them.
 */
export function Testimonials({ section: s }: SectionProps<"testimonials">) {
  const site = useSite();
  if (!s.items.length) {
    if (!site.demo) return null;
    return (
      <SectionShell id={s.id} tone={s.tone} heading={s.heading}>
        <div className="card border-dashed p-6 text-muted">
          <p className="font-semibold text-ink">Reviews appear here once real ones are added.</p>
          <p className="mt-1">This demo does not invent testimonials. Add customer quotes with their source and permission in the site config.</p>
        </div>
      </SectionShell>
    );
  }
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading}>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {s.items.map((t) => (
          <li key={t.quote} className="card p-6 text-ink">
            <figure>
              <blockquote className="text-lg">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm text-muted">
                <span className="font-bold text-ink">{t.author}</span> · {t.source}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
