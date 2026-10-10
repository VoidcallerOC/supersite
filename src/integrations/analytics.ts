/**
 * Analytics boundary. The template ships with provider "none": calls are
 * no-ops and no third-party script is loaded. Add a provider here (and to the
 * schema) when a client has chosen one and the privacy policy covers it.
 */
export type AnalyticsEvent = { name: "cta_click" | "form_submit" | "form_error" | "catalog_filter"; props?: Record<string, string> };

let sink: ((e: AnalyticsEvent) => void) | null = null;

export function setAnalyticsSink(fn: ((e: AnalyticsEvent) => void) | null) {
  sink = fn;
}

export function track(e: AnalyticsEvent) {
  sink?.(e);
}
