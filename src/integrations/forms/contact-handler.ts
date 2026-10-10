import { validateContact, type ContactSubmission } from "./contact-schema";

/**
 * Reference server-side handler for the "endpoint" form provider. It is
 * framework-agnostic and NOT deployed by this template: wire it into the
 * client's serverless platform with a real `deliver` (e.g. a transactional
 * email API) and a shared rate-limit store.
 *
 * The rate-limit key is supplied by the platform rather than read from a raw
 * x-forwarded-for header, which clients can spoof.
 */
export type HandlerDeps = {
  deliver: (data: ContactSubmission) => Promise<void>;
  /** Return false when this client key is over its limit. */
  allow: (clientKey: string) => Promise<boolean> | boolean;
};

export type HandlerResponse = { status: number; body: { ok: boolean; error?: string; fields?: Record<string, string> } };

export async function handleContact(body: unknown, clientKey: string, deps: HandlerDeps): Promise<HandlerResponse> {
  if (!(await deps.allow(clientKey))) return { status: 429, body: { ok: false, error: "rate_limited" } };
  if (typeof body !== "object" || body === null) return { status: 400, body: { ok: false, error: "invalid_body" } };
  const raw = body as Record<string, unknown>;
  // Honeypot filled: pretend success so bots learn nothing, deliver nothing.
  if (typeof raw.website === "string" && raw.website.length > 0) return { status: 200, body: { ok: true } };
  const result = validateContact(raw);
  if (!result.ok) return { status: 422, body: { ok: false, error: "invalid_fields", fields: result.errors as Record<string, string> } };
  try {
    await deps.deliver(result.data);
    return { status: 200, body: { ok: true } };
  } catch {
    return { status: 502, body: { ok: false, error: "delivery_failed" } };
  }
}

/** Simple fixed-window limiter for a single instance. Use a shared store in production. */
export function memoryRateLimiter(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  return (key: string) => {
    const t = now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= t) {
      hits.set(key, { count: 1, resetAt: t + windowMs });
      return true;
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}
