import { defineSite } from "../../src/core/define-site";
import type { SiteConfigInput } from "../../src/core/schema";
import harborline from "../../sites/harborline/site.config";

/**
 * A "launched" variant of Harborline used only by tests: confirmed facts, a
 * real-looking origin and a non-demo form provider. Proves the production
 * paths (indexing, canonical, structured data) without touching any real business.
 */
export function liveVariant(overrides: Partial<SiteConfigInput> = {}) {
  const src = structuredClone(harborline) as SiteConfigInput;
  const confirm = <T extends { status: string; source: string }>(f: T | undefined) => (f ? { ...f, status: "confirmed" as const, source: "Test fixture" } : f);
  const b = src.business!;
  return defineSite({
    ...src,
    demo: false,
    origin: "https://harborline.test",
    business: {
      ...b,
      phone: confirm(b.phone),
      email: confirm(b.email),
      address: confirm(b.address),
      hours: confirm(b.hours),
      serviceArea: confirm(b.serviceArea),
    },
    forms: { contact: { ...src.forms!.contact!, provider: { provider: "endpoint", url: "/api/contact" } } },
    ...overrides,
  } as SiteConfigInput);
}
