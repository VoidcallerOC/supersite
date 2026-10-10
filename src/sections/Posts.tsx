import type { SectionProps } from "./types";
import { SectionShell, StatusMessage } from "../components/ui";
import { useSite } from "../components/site-context";

export function Posts({ section: s }: SectionProps<"posts">) {
  const site = useSite();
  const cfg = site.posts!;
  const sorted = [...cfg.items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const list = s.limit ? sorted.slice(0, s.limit) : sorted;
  return (
    <SectionShell id={s.id} tone={s.tone} heading={s.heading} intro={s.intro}>
      {list.length ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.slug} className="card relative flex flex-col p-6 text-ink">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                {p.tag ? `${p.tag} · ` : ""}
                <time dateTime={p.publishedAt}>
                  {new Date(`${p.publishedAt}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </time>
              </p>
              <h3 className="mt-2">
                <a href={`${cfg.basePath}${p.slug}/`} className="no-underline after:absolute after:inset-0 hover:underline">
                  {p.title}
                </a>
              </h3>
              <p className="mt-2 text-muted">{p.summary}</p>
            </li>
          ))}
        </ul>
      ) : (
        <StatusMessage kind="empty" title="No posts yet" />
      )}
      {s.viewAllHref && list.length ? (
        <p className="mt-8">
          <a className="btn btn-secondary" href={s.viewAllHref}>
            All news
          </a>
        </p>
      ) : null}
    </SectionShell>
  );
}
