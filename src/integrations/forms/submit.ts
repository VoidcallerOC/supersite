import type { FormProvider } from "../../core/schema";
import type { ContactSubmission } from "./contact-schema";

export type SubmitOutcome =
  /** Demo provider: validated, deliberately not sent. */
  | { kind: "demo" }
  /** The endpoint accepted it. */
  | { kind: "sent" }
  /** The visitor's email app was asked to open; we cannot know if they sent it. */
  | { kind: "handoff"; href: string }
  | { kind: "failed"; reason: string };

export type PostLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal },
) => Promise<{ ok: boolean; status: number }>;

export function mailtoHref(to: string, subjectPrefix: string, d: ContactSubmission): string {
  const body = [`Name: ${d.name}`, `Email: ${d.email}`, d.phone ? `Phone: ${d.phone}` : "", "", d.message].filter((l, i) => l !== "" || i === 3).join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(`${subjectPrefix}: ${d.topic}`)}&body=${encodeURIComponent(body)}`;
}

/**
 * Submit through the configured provider. Never reports success it cannot
 * verify: "demo" says nothing was sent, "mailto" says the email app should open.
 */
export async function submitContact(
  provider: FormProvider,
  data: ContactSubmission,
  opts: { siteName: string; post?: PostLike; timeoutMs?: number },
): Promise<SubmitOutcome> {
  if (provider.provider === "demo") return { kind: "demo" };
  if (provider.provider === "mailto") return { kind: "handoff", href: mailtoHref(provider.to, opts.siteName, data) };
  const post = opts.post ?? (globalThis.fetch as unknown as PostLike);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);
  try {
    const res = await post(provider.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (res.ok) return { kind: "sent" };
    if (res.status === 429) return { kind: "failed", reason: "Too many messages from this connection. Please try again in a few minutes." };
    return { kind: "failed", reason: "The message service did not accept the message." };
  } catch {
    return { kind: "failed", reason: "The message could not be sent. Check your connection and try again." };
  } finally {
    clearTimeout(timer);
  }
}
