import type { SectionProps } from "./types";
import { CtaRow } from "../components/ui";
import { HeroArt } from "../components/Art";
import { Icon } from "../components/Icon";

export function Hero({ section: s, isFirst }: SectionProps<"hero">) {
  const H = isFirst ? "h1" : "h2";
  const head = (
    <>
      {s.eyebrow ? <p className="eyebrow mb-4 opacity-85">{s.eyebrow}</p> : null}
      <H id={`${s.id}-heading`}>{s.heading}</H>
      <p className="mt-5 max-w-xl text-lg opacity-90 sm:text-xl">{s.lede}</p>
    </>
  );

  if (s.variant === "centered") {
    return (
      <section id={s.id} aria-labelledby={`${s.id}-heading`} className={`tone-${s.tone} section-y`}>
        <div className="container-site text-center">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            {head}
            <CtaRow ctas={s.ctas} className="mt-8 justify-center" />
          </div>
          {s.art !== "none" ? (
            <div className="mx-auto mt-14 max-w-3xl">
              <HeroArt kind={s.art} />
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (s.variant === "poster") {
    return (
      <section id={s.id} aria-labelledby={`${s.id}-heading`} className={`tone-${s.tone} relative overflow-hidden section-y`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-60 md:block">
          <HeroArt kind={s.art} />
        </div>
        <div className="container-site relative">
          <div className="max-w-2xl">
            {head}
            <CtaRow ctas={s.ctas} className="mt-8" />
            {s.highlights.length ? (
              <ul className="mt-10 flex flex-wrap gap-2">
                {s.highlights.map((h) => (
                  <li key={h} className="tag px-3 py-1 text-sm">
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  if (s.panel) {
    const p = s.panel;
    return (
      <section id={s.id} aria-labelledby={`${s.id}-heading`} className={`tone-${s.tone} section-y`}>
        <div className="container-site grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            {head}
            <CtaRow ctas={s.ctas} className="mt-8" />
            {s.highlights.length ? (
              <ul className="mt-10 grid gap-x-6 gap-y-3 border-t border-border pt-6 sm:grid-cols-2">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-[0.9375rem] font-medium">
                    <Icon name="check" className="mt-0.5 size-5 shrink-0 text-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <figure className="relative">
            <div aria-hidden="true" className="absolute -inset-3 -z-0 hidden rotate-2 rounded-lg bg-surface-alt sm:block" />
            <div className="card relative overflow-hidden">
              <div className="flex items-start justify-between gap-4 border-b border-border bg-accent px-6 py-5 text-accent-ink">
                <div>
                  <p className="eyebrow opacity-80">{p.eyebrow}</p>
                  <p className="mt-1 font-heading text-xl font-semibold">{p.title}</p>
                </div>
                <Icon name="clipboard" className="size-7 shrink-0 opacity-80" />
              </div>
              {p.meta.length ? (
                <dl className="grid grid-cols-2 gap-4 border-b border-border px-6 py-4 text-sm">
                  {p.meta.map((m) => (
                    <div key={m.label}>
                      <dt className="text-muted">{m.label}</dt>
                      <dd className="font-semibold">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <ul className="divide-y divide-border px-6">
                {p.rows.map((r) => (
                  <li key={r.label} className="flex items-baseline justify-between gap-4 py-3.5">
                    <span>
                      <span className="font-medium">{r.label}</span>
                      {r.detail ? <span className="block text-sm text-muted">{r.detail}</span> : null}
                    </span>
                    <span className="font-label font-semibold tabular-nums">{r.value}</span>
                  </li>
                ))}
              </ul>
              {p.total ? (
                <div className="flex items-baseline justify-between gap-4 border-t-2 border-ink px-6 py-4">
                  <span className="font-semibold">{p.total.label}</span>
                  <span className="font-heading text-2xl font-semibold tabular-nums">{p.total.value}</span>
                </div>
              ) : null}
              {p.footnote ? <figcaption className="bg-surface-alt px-6 py-3 text-sm text-muted">{p.footnote}</figcaption> : null}
            </div>
          </figure>
        </div>
      </section>
    );
  }

  return (
    <section id={s.id} aria-labelledby={`${s.id}-heading`} className={`tone-${s.tone} section-y`}>
      <div className="container-site grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
        <div>
          {head}
          <CtaRow ctas={s.ctas} className="mt-8" />
        </div>
        {s.highlights.length ? (
          <ul className="card grid gap-4 p-6 sm:p-8">
            {s.highlights.map((h) => (
              <li key={h} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 grid size-6 shrink-0 place-items-center rounded-pill bg-accent text-sm font-bold text-accent-ink">
                  ✓
                </span>
                <span className="font-semibold">{h}</span>
              </li>
            ))}
          </ul>
        ) : (
          <HeroArt kind={s.art} />
        )}
      </div>
    </section>
  );
}
