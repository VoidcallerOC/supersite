import type { SectionProps } from "./types";
import { SectionShell, StatusMessage } from "../components/ui";
import { ContactForm } from "../components/ContactForm";
import { LocationCard } from "../components/LocationCard";
import { useSite } from "../components/site-context";

export function Contact({ section: s }: SectionProps<"contact">) {
  const site = useSite();
  const form = site.forms[s.form];
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro}>
      <div className={`grid gap-10 ${s.showLocation ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
        <div className="card p-6 text-ink sm:p-8">
          {form ? (
            <ContactForm formKey={s.form} config={form} />
          ) : (
            <StatusMessage kind="error" title="Form not configured">
              This form has no provider set up yet.
            </StatusMessage>
          )}
        </div>
        {s.showLocation ? <LocationCard /> : null}
      </div>
    </SectionShell>
  );
}
