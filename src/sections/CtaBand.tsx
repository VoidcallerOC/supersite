import type { SectionProps } from "./types";
import { CtaRow } from "../components/ui";

export function CtaBand({ section: s }: SectionProps<"cta-band">) {
  return (
    <section id={s.id} aria-labelledby={`${s.id}-heading`} className={`tone-${s.tone} section-y`}>
      <div className="container-site flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <h2 id={`${s.id}-heading`}>{s.heading}</h2>
          {s.body ? <p className="mt-3 text-lg opacity-90">{s.body}</p> : null}
        </div>
        <CtaRow ctas={s.ctas} className="shrink-0" />
      </div>
    </section>
  );
}
