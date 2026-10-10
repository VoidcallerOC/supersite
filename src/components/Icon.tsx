/**
 * Small line-icon set (24px grid, 1.75 stroke, currentColor). Decorative only:
 * every icon is aria-hidden and sits next to visible text.
 */
const PATHS: Record<string, string> = {
  drop: "M12 3.5c3.2 4 5.5 7.2 5.5 10a5.5 5.5 0 0 1-11 0c0-2.8 2.3-6 5.5-10z M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5",
  flame: "M12 3c.6 3 3.5 4.6 3.5 8.3A3.5 3.5 0 0 1 12 15a3.5 3.5 0 0 1-3.5-3.7c0-1.4.6-2.4 1.3-3.3 M6.5 13.5a5.5 5.5 0 0 0 11 0",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z",
  pipe: "M3 8h7a3 3 0 0 1 3 3v10 M3 12h6v9 M2 6v8 M11 21h4",
  radiator: "M5 6v12 M9 6v12 M13 6v12 M17 6v12 M3 18h18 M3 9h18",
  valve: "M12 8v8 M8 4h8 M12 4v4 M3 16h18 M3 20h18 M6 16v4 M18 16v4",
  shower: "M4 20V8a4 4 0 0 1 4-4h2 M10 4a4 4 0 0 1 4 4 M10 8h8 M12 12v1 M15 12v1 M18 12v1 M13 16v1 M16 16v1",
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z M9 12l2 2 4-4",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 7v5l3 2",
  clipboard: "M9 4h6v3H9z M7 5H5v16h14V5h-2 M8 11h8 M8 15h5",
  broom: "M14 3l-3 9 M8 12h8l2 9H6z M10 16v5 M14 16v5",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z M9 4v14 M15 6v14",
  check: "M5 12.5l4.5 4.5L19 7.5",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
};

export const hasIcon = (name: string | undefined): name is string => Boolean(name && PATHS[name]);

export function Icon({ name, className = "size-6" }: { name: string; className?: string }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
