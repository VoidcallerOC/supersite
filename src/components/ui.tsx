import type { ReactNode } from "react";
import type { Cta } from "../core/schema";
import { resolveCta } from "./links";
import { useSite } from "./site-context";
import { track } from "../integrations/analytics";

export function CtaLink({ cta, className = "" }: { cta: Cta; className?: string }) {
  const site = useSite();
  const r = resolveCta(site, cta);
  if (!r) return null;
  return (
    <a
      href={r.href}
      className={`btn btn-${r.variant} ${className}`}
      {...(r.external ? { rel: "noopener noreferrer" } : {})}
      onClick={() => track({ name: "cta_click", props: { label: r.label } })}
    >
      {r.label}
    </a>
  );
}

export function CtaRow({ ctas, className = "" }: { ctas: Cta[]; className?: string }) {
  if (!ctas.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {ctas.map((c) => (
        <CtaLink key={c.label} cta={c} />
      ))}
    </div>
  );
}

/**
 * Visible label on a value the business has not confirmed. Demo-only values
 * are not tagged one by one: every demo page already carries the site-wide
 * demo banner, and demo values are never turned into links.
 */
export function FactTag({ tag }: { tag: "confirm" | "demo" | null }) {
  if (tag !== "confirm") return null;
  return (
    <span className="tag ml-2 align-middle" title="Not yet confirmed by the business">
      To confirm
    </span>
  );
}

type Tone = "default" | "alt" | "accent" | "inverse";

export function SectionShell({
  id,
  tone,
  eyebrow,
  heading,
  intro,
  children,
  headingLevel = 2,
  align = "left",
}: {
  id: string;
  tone: Tone;
  eyebrow?: string;
  heading: string;
  intro?: string;
  children?: ReactNode;
  headingLevel?: 1 | 2;
  align?: "left" | "center";
}) {
  const H = headingLevel === 1 ? "h1" : "h2";
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`tone-${tone} section-y`}>
      <div className="container-site">
        <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}>
          {eyebrow ? <p className="eyebrow mb-3 opacity-80">{eyebrow}</p> : null}
          <H id={`${id}-heading`}>{heading}</H>
          {intro ? <p className="mt-4 text-lg opacity-85">{intro}</p> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

type StatusKind = "info" | "empty" | "error" | "success" | "loading";

/**
 * One component for loading, empty, error and success states so every page
 * reports problems the same way. Errors use role="alert", the rest role="status".
 */
export function StatusMessage({ kind, title, children }: { kind: StatusKind; title: string; children?: ReactNode }) {
  const icon = { info: "i", empty: "∅", error: "!", success: "✓", loading: "…" }[kind];
  const color = kind === "error" ? "text-danger" : kind === "success" ? "text-success" : "text-muted";
  return (
    <div role={kind === "error" ? "alert" : "status"} className="card flex gap-4 p-5" data-state={kind}>
      <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-pill border-2 font-bold ${color}`}>
        {icon}
      </span>
      <div>
        <p className="font-bold">{title}</p>
        {children ? <div className="mt-1 text-muted">{children}</div> : null}
      </div>
    </div>
  );
}

export function Monogram({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`grid size-10 place-items-center rounded-md bg-accent font-heading text-lg font-black text-accent-ink ${className}`}>
      {text}
    </span>
  );
}
