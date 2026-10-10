/** All money is integer cents; formatting is the only place it becomes a decimal. */
export function formatCents(cents: number, currency = "USD", locale = "en-US"): string {
  if (!Number.isInteger(cents)) throw new Error(`formatCents expects integer cents, got ${cents}`);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
