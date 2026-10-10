import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { FormConfig } from "../core/schema";
import { validateContact, type FieldErrors } from "../integrations/forms/contact-schema";
import { submitContact, type PostLike, type SubmitOutcome } from "../integrations/forms/submit";
import { track } from "../integrations/analytics";
import { StatusMessage } from "./ui";
import { useSite } from "./site-context";
import { viewFact } from "../core/facts";

type State = { phase: "idle" } | { phase: "submitting" } | { phase: "done"; outcome: SubmitOutcome };

const FIELDS = ["name", "email", "phone", "topic", "message"] as const;

export function ContactForm({ formKey, config, post }: { formKey: string; config: FormConfig; post?: PostLike }) {
  const site = useSite();
  const uid = useId();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<State>({ phase: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const id = (f: string) => `${uid}-${f}`;
  const phone = viewFact(site, site.business.phone);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const result = validateContact(data);
    if (!result.ok) {
      setErrors(result.errors);
      track({ name: "form_error", props: { form: formKey } });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    setState({ phase: "submitting" });
    const outcome = await submitContact(config.provider, result.data, { siteName: site.brand.name, post });
    if (outcome.kind === "handoff") window.location.href = outcome.href;
    setState({ phase: "done", outcome });
    track({ name: "form_submit", props: { form: formKey, outcome: outcome.kind } });
    requestAnimationFrame(() => resultRef.current?.focus());
  }

  const errorList = FIELDS.filter((f) => errors[f]);
  const done = state.phase === "done" ? state.outcome : null;
  const keepForm = !done || done.kind === "failed";

  return (
    <div>
      <div ref={resultRef} tabIndex={-1} className="outline-none">
        {done?.kind === "demo" ? (
          <StatusMessage kind="info" title="Demo only: nothing was sent">
            Your message passed validation, but this is a demo site so it was not delivered to anyone. On a live site this form posts to the business&rsquo;s
            own inbox.
          </StatusMessage>
        ) : null}
        {done?.kind === "sent" ? (
          <StatusMessage kind="success" title="Message sent">
            Thanks — your message reached {site.brand.name}.
          </StatusMessage>
        ) : null}
        {done?.kind === "handoff" ? (
          <StatusMessage kind="info" title="Finish in your email app">
            Your email app should have opened with the message filled in. It is not sent until you press send there. <a href={done.href}>Open it again</a>.
          </StatusMessage>
        ) : null}
        {done?.kind === "failed" ? (
          <StatusMessage kind="error" title="Your message was not sent">
            {done.reason}
            {phone.show && phone.tag !== "demo" ? ` You can also call ${phone.value}.` : ""} Your answers are still in the form below.
          </StatusMessage>
        ) : null}
      </div>

      {keepForm ? (
        <form noValidate onSubmit={onSubmit} aria-describedby={`${id("privacy")}`} className={done ? "mt-6" : ""}>
          {errorList.length ? (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="card mb-6 border-danger p-4 outline-none">
              <p className="font-bold text-danger">Please fix {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}:</p>
              <ul className="mt-2 list-disc pl-5">
                {errorList.map((f) => (
                  <li key={f}>
                    <a href={`#${id(f)}`}>{errors[f]}</a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field id={id("name")} label="Name" error={errors.name}>
              <input id={id("name")} name="name" autoComplete="name" required className="field-input" {...invalid(id("name"), errors.name)} />
            </Field>
            <Field id={id("email")} label="Email" error={errors.email}>
              <input id={id("email")} name="email" type="email" autoComplete="email" required className="field-input" {...invalid(id("email"), errors.email)} />
            </Field>
            <Field id={id("phone")} label="Phone (optional)" error={errors.phone}>
              <input id={id("phone")} name="phone" type="tel" autoComplete="tel" className="field-input" {...invalid(id("phone"), errors.phone)} />
            </Field>
            <Field id={id("topic")} label="Topic" error={errors.topic}>
              <select id={id("topic")} name="topic" required defaultValue="" className="field-input" {...invalid(id("topic"), errors.topic)}>
                <option value="" disabled>
                  Choose one
                </option>
                {config.topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field id={id("message")} label="Message" error={errors.message}>
                <textarea id={id("message")} name="message" rows={5} required className="field-input" {...invalid(id("message"), errors.message)} />
              </Field>
            </div>
          </div>

          {/* Honeypot: hidden from people and assistive tech, attractive to bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor={id("website")}>Leave this empty</label>
            <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className="btn btn-primary" disabled={state.phase === "submitting"}>
              {state.phase === "submitting" ? "Sending…" : config.submitLabel}
            </button>
            {config.provider.provider === "demo" ? <span className="tag">Demo form: sends nothing</span> : null}
          </div>
          <p id={id("privacy")} className="field-hint mt-4">
            {config.privacyNote}
          </p>
        </form>
      ) : null}
    </div>
  );
}

function invalid(fieldId: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${fieldId}-error` } : {};
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
