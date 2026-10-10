import type { SectionProps } from "./types";
import { SectionShell } from "../components/ui";
import { LocationCard } from "../components/LocationCard";

export function HoursLocation({ section: s }: SectionProps<"hours-location">) {
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro}>
      <LocationCard wide />
    </SectionShell>
  );
}
