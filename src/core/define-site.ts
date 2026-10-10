import { siteConfig, type SiteConfig, type SiteConfigInput } from "./schema";

/**
 * Validate a site config. Throws a readable error listing every problem, so a
 * broken config fails the build instead of shipping a half-rendered page.
 */
export function defineSite(input: SiteConfigInput): SiteConfig {
  const parsed = siteConfig.safeParse(input);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new Error(`Invalid site config "${String((input as { id?: string }).id)}":\n${lines.join("\n")}`);
  }
  const site = parsed.data;
  const problems = crossCheck(site);
  if (problems.length) {
    throw new Error(`Invalid site config "${site.id}":\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  }
  return site;
}

/** Rules the schema alone cannot express. */
export function crossCheck(site: SiteConfig): string[] {
  const problems: string[] = [];
  const paths = new Set<string>();
  for (const p of site.pages) {
    if (paths.has(p.path)) problems.push(`duplicate page path ${p.path}`);
    paths.add(p.path);
    const ids = new Set<string>();
    for (const s of p.sections) {
      if (ids.has(s.id)) problems.push(`duplicate section id "${s.id}" on ${p.path}`);
      ids.add(s.id);
      if (s.type === "catalog" && !site.catalog) problems.push(`${p.path}#${s.id}: catalog section but no catalog config`);
      if (s.type === "events" && !site.events) problems.push(`${p.path}#${s.id}: events section but no events config`);
      if (s.type === "posts" && !site.posts) problems.push(`${p.path}#${s.id}: posts section but no posts config`);
      if (s.type === "contact" && !site.forms[s.form]) problems.push(`${p.path}#${s.id}: form "${s.form}" is not configured`);
    }
  }
  for (const p of site.pages) {
    const first = p.sections.find((s) => !s.hidden);
    if (first?.type !== "hero" && !p.heading) problems.push(`${p.path}: needs a "heading" (h1) because its first section is not a hero`);
  }
  if (!paths.has("/")) problems.push('no home page ("/")');
  const titles = new Map<string, string>();
  for (const p of site.pages) {
    const prev = titles.get(p.title);
    if (prev) problems.push(`pages ${prev} and ${p.path} share the title "${p.title}"`);
    titles.set(p.title, p.path);
  }
  for (const e of site.events?.items ?? []) {
    if (e.endsAt && Date.parse(e.endsAt) <= Date.parse(e.startsAt)) problems.push(`event ${e.slug} ends before it starts`);
  }
  return problems;
}
