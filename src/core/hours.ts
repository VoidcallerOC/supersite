import type { DayKey, WeeklyHours } from "./schema";

export const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_LABEL: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
const SCHEMA_DAY: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** Day and minutes-since-midnight in the business's timezone, not the visitor's. */
export function zonedNow(now: Date, timezone: string): { day: DayKey; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday").slice(0, 3).toLowerCase() as DayKey;
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));

export type OpenStatus = { open: boolean; label: string };

export function openStatus(hours: WeeklyHours, now: Date): OpenStatus {
  const { day, minutes } = zonedNow(now, hours.timezone);
  const today = hours.days.find((d) => d.day === day);
  for (const r of today?.ranges ?? []) {
    if (minutes >= toMin(r.opens) && minutes < toMin(r.closes)) {
      return { open: true, label: `Open now · until ${formatTime(r.closes)}` };
    }
  }
  const later = (today?.ranges ?? []).find((r) => toMin(r.opens) > minutes);
  if (later) return { open: false, label: `Closed now · opens ${formatTime(later.opens)} today` };
  const idx = DAY_ORDER.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const d = DAY_ORDER[(idx + i) % 7];
    const first = hours.days.find((x) => x.day === d)?.ranges[0];
    if (first) return { open: false, label: `Closed now · opens ${DAY_LABEL[d]} ${formatTime(first.opens)}` };
  }
  return { open: false, label: "Closed" };
}

export function formatTime(hhmm: string): string {
  const h = Number(hhmm.slice(0, 2));
  const m = hhmm.slice(3);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${h12}${suffix}` : `${h12}:${m}${suffix}`;
}

export function formatRanges(ranges: { opens: string; closes: string }[]): string {
  if (!ranges.length) return "Closed";
  return ranges.map((r) => `${formatTime(r.opens)}–${formatTime(r.closes)}`).join(", ");
}

/** schema.org openingHoursSpecification built from the same single source as the UI. */
export function openingHoursSpecification(hours: WeeklyHours) {
  return hours.days.flatMap((d) =>
    d.ranges.map((r) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SCHEMA_DAY[d.day],
      opens: r.opens,
      closes: r.closes,
    })),
  );
}
