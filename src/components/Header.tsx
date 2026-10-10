import { useEffect, useId, useRef, useState } from "react";
import { useSite } from "./site-context";
import { CtaLink, FactTag, Monogram } from "./ui";
import { isCurrent } from "./links";
import { viewFact, telHref } from "../core/facts";
import { OpenNow } from "./OpenNow";

export function Header({ currentPath }: { currentPath: string }) {
  const site = useSite();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes and returns focus; clicking outside closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const phone = viewFact(site, site.business.phone);
  const hours = viewFact(site, site.business.hours);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85">
      {site.header.variant === "utility" && (phone.show || hours.show) ? (
        <div className="tone-inverse text-sm">
          <div className="container-site flex min-h-9 flex-wrap items-center justify-between gap-x-4 py-1">
            {hours.show ? <OpenNow hours={hours.value} /> : <span />}
            {phone.show ? (
              <span>
                {phone.tag === "demo" ? (
                  <span>Call {phone.value}</span>
                ) : (
                  <a href={telHref(phone.value)} className="font-bold">
                    Call {phone.value}
                  </a>
                )}
                <FactTag tag={phone.tag} />
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
      <div className="container-site flex min-h-16 items-center justify-between gap-4 py-2">
        <a href="/" className="flex items-center gap-3 no-underline" aria-label={`${site.brand.name}, home`}>
          <Monogram text={site.brand.monogram} />
          <span className="font-heading text-lg leading-tight font-bold [text-transform:var(--heading-case)]">{site.brand.shortName}</span>
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {site.nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  aria-current={isCurrent(currentPath, n.href) ? "page" : undefined}
                  className="rounded-sm px-3 py-2 font-semibold no-underline hover:underline aria-[current=page]:underline aria-[current=page]:decoration-2"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {site.header.cta ? <CtaLink cta={site.header.cta} className="hidden sm:inline-flex" /> : null}
          <button
            ref={buttonRef}
            type="button"
            className="btn btn-secondary lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {open ? "×" : "≡"}
            </span>
            Menu
          </button>
        </div>
      </div>

      <div ref={panelRef} id={panelId} hidden={!open} className="border-t border-border bg-surface lg:hidden">
        <nav aria-label="Mobile" className="container-site py-3">
          <ul className="grid gap-1">
            {site.nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  aria-current={isCurrent(currentPath, n.href) ? "page" : undefined}
                  className="block rounded-sm px-3 py-3 text-lg font-semibold no-underline aria-[current=page]:underline"
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          {site.header.cta ? (
            <div className="mt-3 border-t border-border pt-4">
              <CtaLink cta={site.header.cta} className="w-full" />
            </div>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
