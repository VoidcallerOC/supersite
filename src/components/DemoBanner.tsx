import { useSite } from "./site-context";

/** Shown on every page of a demo build. It cannot be turned off without setting demo: false. */
export function DemoBanner() {
  const site = useSite();
  if (!site.demo) return null;
  return (
    <div role="note" aria-label="Demo notice" className="tone-accent text-center text-sm font-semibold">
      <p className="container-site py-2">Demo site with fictional content. {site.brand.name} is not a real business.</p>
    </div>
  );
}
