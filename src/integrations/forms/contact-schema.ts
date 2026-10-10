/**
 * Contact submission validation, shared by the browser form and the reference
 * server handler so both apply identical rules. Plain TypeScript (no schema
 * library) keeps it out of the client bundle's weight budget.
 */
export type ContactSubmission = {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  /** Honeypot: real visitors never see or fill this. */
  website: string;
};

export type FieldErrors = Partial<Record<keyof ContactSubmission, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: unknown) => (typeof v === "string" ? v : "");

export function validateContact(input: Record<string, unknown>): { ok: true; data: ContactSubmission } | { ok: false; errors: FieldErrors } {
  const data: ContactSubmission = {
    name: str(input.name).trim(),
    email: str(input.email).trim(),
    phone: str(input.phone).trim(),
    topic: str(input.topic).trim(),
    message: str(input.message).trim(),
    website: str(input.website),
  };
  const errors: FieldErrors = {};
  if (data.name.length < 2) errors.name = "Enter your name";
  else if (data.name.length > 100) errors.name = "Keep your name under 100 characters";
  if (!EMAIL.test(data.email) || data.email.length > 200) errors.email = "Enter a valid email address";
  if (data.phone && (data.phone.replace(/\D/g, "").length < 10 || data.phone.length > 30)) errors.phone = "Enter a 10-digit phone number or leave it blank";
  if (!data.topic) errors.topic = "Choose a topic";
  if (data.message.length < 10) errors.message = "Tell us a little more (at least 10 characters)";
  else if (data.message.length > 4000) errors.message = "Keep the message under 4,000 characters";
  if (data.website) errors.website = "Unexpected field";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
