import type { EventItem, PostItem, Product } from "../core/schema";
import type { Crumb } from "../core/routes";
import { useSite } from "../components/site-context";
import { PageHeader } from "./PageHeader";
import { ProductArt } from "../components/Art";
import { CtaLink, StatusMessage } from "../components/ui";
import { formatCents } from "../core/money";
import { stockLabel } from "../integrations/catalog/view";
import { formatEventDate } from "../core/events";

export function ProductPage({ product: p, crumbs }: { product: Product; crumbs: Crumb[] }) {
  const site = useSite();
  const cfg = site.catalog!;
  const stock = stockLabel(p.quantity);
  const category = cfg.categories.find((c) => c.id === p.category)?.label ?? p.category;
  return (
    <>
      <PageHeader heading={p.name} crumbs={crumbs} />
      <div className="container-site section-y grid gap-10 lg:grid-cols-2">
        {p.image ? (
          <img src={p.image.src} alt={p.image.alt} width={p.image.width} height={p.image.height} className="w-full rounded-lg" />
        ) : (
          <ProductArt art={p.art} label="Photo coming soon" />
        )}
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted uppercase">{category}</p>
          <p className="mt-2 font-label text-4xl font-black">{formatCents(p.priceCents, cfg.currency)}</p>
          <p className="mt-2">
            <span className={`tag ${stock.tone === "out" ? "text-danger" : stock.tone === "ok" ? "text-success" : ""}`}>{stock.label}</span>
            {p.condition ? <span className="ml-3 text-muted">Condition: {p.condition}</span> : null}
          </p>
          <p className="mt-6 text-lg">{p.summary}</p>
          {p.details.length ? (
            <ul className="mt-4 list-disc space-y-1 pl-5">
              {p.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8">
            <StatusMessage kind="info" title="Buy in store or reserve">
              Online checkout is not enabled for this store. Ask us to hold it and pick it up in person.
            </StatusMessage>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <CtaLink cta={{ label: "Ask us to hold it", href: cfg.inquiryHref, variant: "primary" }} />
            <a className="btn btn-secondary" href={cfg.basePath}>
              Back to the catalog
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export function EventPage({ event: e, crumbs }: { event: EventItem; crumbs: Crumb[] }) {
  const site = useSite();
  const tz = site.business.hours?.value.timezone ?? "America/New_York";
  const d = formatEventDate(e, tz);
  return (
    <>
      <PageHeader heading={e.title} crumbs={crumbs}>
        <p className="mt-4 text-lg">
          <time dateTime={e.startsAt}>{d.full}</time> · {d.time}
        </p>
      </PageHeader>
      <div className="container-site section-y grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 text-lg">
          {e.status === "cancelled" ? (
            <StatusMessage kind="error" title="This event is cancelled">
              Check the events page for other dates.
            </StatusMessage>
          ) : null}
          <p>{e.summary}</p>
          {e.details.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
        <aside aria-label="Event details" className="card h-fit p-6 text-ink">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-semibold text-muted uppercase">Type</dt>
              <dd>{e.category}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-muted uppercase">Entry</dt>
              <dd>{e.entryFeeCents === null ? "Free" : formatCents(e.entryFeeCents)}</dd>
            </div>
            {e.capacity ? (
              <div>
                <dt className="text-sm font-semibold text-muted uppercase">Seats</dt>
                <dd>{e.capacity} players</dd>
              </div>
            ) : null}
          </dl>
          <a className="btn btn-secondary mt-6 w-full" href={site.events!.basePath}>
            All events
          </a>
        </aside>
      </div>
    </>
  );
}

export function PostPage({ post: p, crumbs }: { post: PostItem; crumbs: Crumb[] }) {
  return (
    <>
      <PageHeader heading={p.title} crumbs={crumbs}>
        <p className="mt-4 text-muted">
          {p.tag ? `${p.tag} · ` : ""}
          <time dateTime={p.publishedAt}>
            {new Date(`${p.publishedAt}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
          </time>
        </p>
      </PageHeader>
      <article className="container-site section-y">
        <div className="max-w-2xl space-y-5 text-lg">
          {p.body.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
      </article>
    </>
  );
}

export function NotFoundPage() {
  const site = useSite();
  return (
    <div className="container-site section-y max-w-2xl">
      <p className="eyebrow text-muted">Error 404</p>
      <h1 className="mt-3">We can&rsquo;t find that page</h1>
      <p className="mt-4 text-lg">The link may be old or mistyped. Try one of these instead:</p>
      <ul className="mt-6 flex flex-wrap gap-3">
        <li>
          <a className="btn btn-primary" href="/">
            Home
          </a>
        </li>
        {site.nav.slice(0, 4).map((n) => (
          <li key={n.href}>
            <a className="btn btn-secondary" href={n.href}>
              {n.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
