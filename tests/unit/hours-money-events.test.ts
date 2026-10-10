import { describe, expect, it } from "vitest";
import { formatRanges, openStatus, zonedNow } from "../../src/core/hours";
import { formatCents } from "../../src/core/money";
import { isPast, sortEvents } from "../../src/core/events";
import harborline from "../../sites/harborline/site.config";
import lantern from "../../sites/lantern/site.config";

const hours = harborline.business.hours!.value;

describe("open now (business timezone, not visitor's)", () => {
  it("Tuesday 10:00 Eastern is open", () => {
    expect(openStatus(hours, new Date("2026-10-13T14:00:00Z"))).toEqual({ open: true, label: "Open now · until 5pm" });
  });
  it("Tuesday 06:00 Eastern is closed but opens later today", () => {
    expect(openStatus(hours, new Date("2026-10-13T10:00:00Z")).label).toBe("Closed now · opens 7:30am today");
  });
  it("Saturday after noon rolls to Monday (Sunday closed)", () => {
    expect(openStatus(hours, new Date("2026-10-17T18:00:00Z")).label).toBe("Closed now · opens Monday 7:30am");
  });
  it("the same instant is evaluated in store time regardless of where it is computed", () => {
    // 2026-10-14T02:30Z is Tuesday 22:30 in New York but Wednesday in UTC.
    expect(zonedNow(new Date("2026-10-14T02:30:00Z"), "America/New_York")).toEqual({ day: "tue", minutes: 22 * 60 + 30 });
  });
  it("handles the DST change (EST in November)", () => {
    expect(openStatus(hours, new Date("2026-11-10T12:45:00Z")).open).toBe(true); // 07:45 EST
  });
  it("formats ranges and closed days", () => {
    expect(formatRanges([])).toBe("Closed");
    expect(formatRanges([{ opens: "07:30", closes: "17:00" }])).toBe("7:30am–5pm");
  });
});

describe("money is integer cents", () => {
  it("formats", () => {
    expect(formatCents(11999)).toBe("$119.99");
    expect(formatCents(1500)).toBe("$15");
  });
  it("refuses floats", () => {
    expect(() => formatCents(19.99)).toThrow(/integer cents/);
  });
});

describe("events", () => {
  const items = lantern.events!.items;
  it("sorts chronologically and identifies past events", () => {
    const sorted = sortEvents(items);
    expect(sorted[0].slug).toBe("friday-night-draft-2026-09-25");
    const now = Date.parse("2026-10-10T12:00:00Z");
    expect(sorted.filter((e) => isPast(e, now)).map((e) => e.slug)).toEqual(["friday-night-draft-2026-09-25"]);
  });
});
