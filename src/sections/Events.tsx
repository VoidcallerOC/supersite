import type { SectionProps } from "./types";
import { SectionShell, StatusMessage } from "../components/ui";
import { useSite } from "../components/site-context";
import { formatCents } from "../core/money";
import { formatEventDate, isPast, sortEvents } from "../core/events";
import { usePageOpenedAt } from "../components/client-state";

export function Events({ section: s }: SectionProps<"events">) {
  const site = useSite();
  const cfg = site.events!;
  const tz = site.business.hours?.value.timezone ?? "America/New_York";
  // Past/upcoming depends on "now": decided after hydration so static HTML never goes stale silently.
  const now = usePageOpenedAt();

  const sorted = sortEvents(cfg.items);
  const visible = now === null ? sorted : sorted.filter((e) => !isPast(e, now));
  const list = s.limit ? visible.slice(0, s.limit) : visible;

  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro}>
      {list.length ? (
        <ul className="grid gap-4">
          {list.map((e) => {
            const d = formatEventDate(e, tz);
            return (
              <li key={e.slug} className="card relative grid gap-4 p-5 text-ink sm:grid-cols-[6rem_1fr_auto] sm:items-center">
                <div className="font-label">
                  <span className="block text-sm font-bold text-muted uppercase">{d.weekday}</span>
                  <span className="block text-2xl font-black">{d.day}</span>
                  <span className="block text-sm">{d.month}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                    {e.category} · <time dateTime={e.startsAt}>{d.time}</time>
                  </p>
                  <h3 className="mt-1">
                    <a href={`${cfg.basePath}${e.slug}/`} className="no-underline after:absolute after:inset-0 hover:underline">
                      {e.title}
                    </a>
                  </h3>
                  <p className="mt-1 text-muted">{e.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                  {e.status === "cancelled" ? <span className="tag text-danger">Cancelled</span> : null}
                  <span className="tag">{e.entryFeeCents === null ? "Free" : `${formatCents(e.entryFeeCents)} entry`}</span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <StatusMessage kind="empty" title="No upcoming events posted">
          New events are added regularly — check back soon.
        </StatusMessage>
      )}
      {s.viewAllHref && list.length ? (
        <p className="mt-8">
          <a className="btn btn-secondary" href={s.viewAllHref}>
            See all events
          </a>
        </p>
      ) : null}
    </SectionShell>
  );
}
