import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Time the page was opened in the browser; the server snapshot is null. */
const PAGE_OPENED_AT = typeof window === "undefined" ? 0 : Date.now();

/**
 * Browser-only values that must not appear in prerendered HTML (time, URL).
 * The server snapshot keeps hydration consistent; the client value applies
 * right after hydration.
 */
export function usePageOpenedAt(): number | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => PAGE_OPENED_AT,
    () => null,
  );
}

const subscribeToHistory = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  return () => window.removeEventListener("popstate", cb);
};

export function useLocationSearch(): string {
  return useSyncExternalStore(
    subscribeToHistory,
    () => window.location.search,
    () => "",
  );
}
