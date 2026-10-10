import type { SectionProps } from "./types";
import { SectionShell } from "../components/ui";

const COLS = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" } as const;

export function Features({ section: s }: SectionProps<"features">) {
  return (
    <SectionShell id={s.id} tone={s.tone} eyebrow={s.eyebrow} heading={s.heading} intro={s.intro}>
      <ul className={`grid gap-5 ${COLS[s.columns]}`}>
        {s.items.map((item) => (
          <li key={item.title} className="card relative flex flex-col p-6 text-ink">
            {item.icon ? (
              <span aria-hidden="true" className="mb-4 grid size-11 place-items-center rounded-md bg-surface-alt text-xl">
                {item.icon}
              </span>
            ) : null}
            <h3>
              {item.href ? (
                <a href={item.href} className="no-underline after:absolute after:inset-0 hover:underline">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h3>
            <p className="mt-2 text-muted">{item.body}</p>
            {item.meta ? <p className="mt-auto pt-4 font-label text-sm font-bold">{item.meta}</p> : null}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
