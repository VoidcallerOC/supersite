import type { SectionProps } from "./types";
import { CtaRow } from "../components/ui";
import { HeroArt } from "../components/Art";

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
