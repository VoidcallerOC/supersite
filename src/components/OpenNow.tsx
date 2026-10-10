import { useEffect, useState } from "react";
import type { WeeklyHours } from "../core/schema";
import { openStatus, type OpenStatus } from "../core/hours";

/**
 * "Open now" depends on the current time, so it is computed in the browser
 * after hydration (in the business's timezone). The prerendered HTML shows
 * nothing here rather than a status that may be stale by the time it is read.
 */
export function OpenNow({ hours, className = "" }: { hours: WeeklyHours; className?: string }) {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const update = () => setStatus(openStatus(hours, new Date()));
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [hours]);
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} data-open={status.open}>
      <span aria-hidden="true" className={`size-2.5 rounded-pill ${status.open ? "bg-success" : "bg-danger"}`} />
      {status.label}
    </span>
  );
}
