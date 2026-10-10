import { describe, expect, it } from "vitest";
import { viewFact, telHref, confirmedValue } from "../../src/core/facts";
import { resolveCta, resolveFactHref } from "../../src/components/links";
import harborline from "../../sites/harborline/site.config";
import tallyhook from "../../sites/tallyhook/site.config";
import { liveVariant } from "../fixtures/live-site";

const f = (status: "confirmed" | "unconfirmed" | "demo") => ({ value: "x", status, source: "test" });

describe("viewFact", () => {
  it.each([
    [true, "confirmed", { show: true, value: "x", tag: null }],
    [true, "unconfirmed", { show: true, value: "x", tag: "confirm" }],
    [true, "demo", { show: true, value: "x", tag: "demo" }],
    [false, "confirmed", { show: true, value: "x", tag: null }],
    [false, "unconfirmed", { show: false }],
    [false, "demo", { show: false }],
  ] as const)("demo=%s status=%s", (demo, status, expected) => {
    expect(viewFact({ demo }, f(status))).toEqual(expected);
  });

  it("only confirmed values are machine-readable", () => {
    expect(confirmedValue(f("unconfirmed"))).toBeUndefined();
    expect(confirmedValue(f("confirmed"))).toBe("x");
  });

  it("builds E.164 tel links", () => {
    expect(telHref("(555) 010-0142")).toBe("tel:+15550100142");
  });
});

describe("CTA resolution never links fictional facts", () => {
  it("demo phone falls back to the configured target", () => {
    expect(resolveFactHref(harborline, "$phone")).toBeNull();
    expect(resolveCta(harborline, harborline.header.cta!)).toMatchObject({ label: "Request a visit", href: "/contact/" });
  });

  it("demo app URL falls back to the waitlist", () => {
    expect(resolveCta(tallyhook, tallyhook.header.cta!)).toMatchObject({ label: "Join the waitlist", href: "/#waitlist" });
  });

  it("confirmed phone in a live site becomes a tel: link", () => {
    const live = liveVariant();
    expect(resolveCta(live, live.header.cta!)).toMatchObject({ label: "Call now", href: "tel:+15550100142" });
  });

  it("a CTA with no resolvable target and no fallback is dropped", () => {
    expect(resolveCta(harborline, { label: "Email", href: "$email", variant: "primary" })).toBeNull();
  });
});
