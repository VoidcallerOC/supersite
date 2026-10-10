import type { SectionProps } from "./types";
import { SectionShell } from "../components/ui";

export function Steps({ section: s }: SectionProps<"steps">) {
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro}>
      <ol className="grid gap-6 md:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
        {s.steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-pill border-2 border-current font-label font-bold">
              {i + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p className="mt-1 opacity-85">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
