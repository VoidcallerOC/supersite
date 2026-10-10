import type { EventItem } from "./schema";

export const sortEvents = (items: EventItem[]) => [...items].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));

/** An event is past once it has ended (or started, when no end time is given). */
export const isPast = (e: EventItem, now: number) => Date.parse(e.endsAt ?? e.startsAt) < now;

export function formatEventDate(e: EventItem, timezone: string) {
  const d = new Date(e.startsAt);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: timezone, ...o }).format(d);
  const end = e.endsAt ? new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(new Date(e.endsAt)) : null;
  const start = f({ hour: "numeric", minute: "2-digit" });
  return {
    weekday: f({ weekday: "short" }),
    day: f({ day: "numeric" }),
    month: f({ month: "short" }),
    full: f({ weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    time: end ? `${start}–${end}` : start,
  };
}
