/**
 * Every external data source returns one of three honest states. Pages render
 * each state explicitly, so a broken feed never looks like an empty shop and
 * an empty shop never looks like a broken feed.
 */
export type ProviderResult<T> =
  { status: "ok"; data: T; warnings: string[] } | { status: "empty"; warnings: string[] } | { status: "unavailable"; reason: string };

export const ok = <T>(data: T, warnings: string[] = []): ProviderResult<T> => ({ status: "ok", data, warnings });
export const empty = <T>(warnings: string[] = []): ProviderResult<T> => ({ status: "empty", warnings });
export const unavailable = <T>(reason: string): ProviderResult<T> => ({ status: "unavailable", reason });
