import type { SectionProps } from "./types";
import { SectionShell } from "../components/ui";

export function RichText({ section: s }: SectionProps<"rich-text">) {
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading}>
      <div className="max-w-2xl space-y-4 text-lg">
        {s.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </SectionShell>
  );
}
