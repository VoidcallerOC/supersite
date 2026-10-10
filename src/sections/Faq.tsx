import type { SectionProps } from "./types";
import { SectionShell } from "../components/ui";

/** Native <details> disclosures: keyboard and screen-reader support with no script. */
export function Faq({ section: s }: SectionProps<"faq">) {
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading}>
      <div className="max-w-3xl divide-y divide-border border-y border-border">
        {s.items.map((item) => (
          <details key={item.q} className="group py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {item.q}
              <span aria-hidden="true" className="text-2xl transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-4 opacity-85">{item.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
