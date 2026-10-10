# Architecture

Design decisions behind the template, recorded as short ADRs.

## ADR-1 — Vite + React 19 + TypeScript + Tailwind 4, prerendered to static HTML

**Context.** Most small-business sites (brochures, catalogs, event listings) need no request-time server. The most common SEO failure in comparable hand-built sites is content that appears only after JavaScript runs.

| Option | Verdict |
|---|---|
| Zero-build HTML + a browser-side renderer | Rejected: lists rendered by JS are invisible to non-JS crawlers; weak testing story |
| Full-stack meta-framework with server functions (e.g. TanStack Start + Nitro) | Rejected for the template: request-time server, beta dependencies at the time of writing, and scaffold weight a brochure site doesn't need. Still a good choice for sites that need checkout or holds (ADR-6). |
| Next.js | Viable alternative; not chosen to keep one simple, static-first build |
| A new framework with no team familiarity | Rejected |
| **Vite + React with a build-time prerender step** | **Accepted.** Familiar packages, every route is complete HTML, React hydrates only what is interactive, no server to secure, hosts anywhere static. |

`scripts/build.mjs` runs a Vite SSR build of `src/entry-server.tsx`, renders every route with `react-dom/server`, then runs a client build for hydration.

## ADR-2 — One config file per site; one site per build

Each client is `sites/<id>/site.config.ts`, validated by `defineSite()` (zod schema plus cross-checks: duplicate ids and titles, missing h1 source, sections without data, dangling form references). A Vite plugin resolves `virtual:site` to exactly one config per build, so one client's content can never appear in another's bundle; an output test asserts this.

## ADR-3 — Section registry

A page is an ordered array of typed sections, each with `hidden` and `tone`. `SECTIONS` in `src/sections/registry.tsx` is a mapped type: TypeScript fails if a schema section has no component. Adding a section is one schema entry, one component and one registry line.

## ADR-4 — Facts with status and source; launch gate

- `confirmed` facts are shown normally.
- `unconfirmed` facts are tagged "To confirm" in demos and hidden in live builds.
- `demo` facts are tagged "Demo" and **never linked**. CTAs that point at `$phone`, `$app` and so on fall back to a configured target.
- Structured data uses confirmed facts only.

`--production` builds fail **before writing anything** if `launchProblems()` reports demo mode, a missing origin, demo or unconfirmed facts, a sample catalog, or a demo form. Testimonials require `source` and `permission: true` at the type level.

## ADR-5 — Indexing is opt-in

`isIndexable = production build && !demo && origin set && route ≠ 404`. Otherwise the build emits meta `noindex, nofollow`, an `X-Robots-Tag` header, `robots.txt Disallow: /`, no sitemap and no canonical.

## ADR-6 — Integrations behind explicit boundaries; credential-free by default

| Boundary | Default | Live option |
|---|---|---|
| Forms | `demo`: validates, says nothing was sent | `endpoint` (POST JSON to your handler) or `mailto` (honest handoff) |
| Form handler | — | `handleContact()` reference: validation, honeypot, rate limit; tested, not deployed |
| Catalog | `none` or `fixture` (labelled "sample") | `http`: read-only JSON at build time, with timeout and per-item validation |
| Analytics | `none`, a no-op `track()` | Add a provider once a client chooses one |
| CMS | Content lives in the config file | Any CMS that outputs the same typed shapes at build time |
| Payments | None. Product pages offer a hold request. | Out of scope: use a server runtime with server-side price recomputation and verified webhooks |

Data is fetched **at build time**, so no API key ever sits on a public request path. The trade-off is freshness: content is only as current as the last build.

## ADR-7 — Validation library at build time only

The site config is validated in the SSR bundle. The client receives plain pre-validated JSON with bulk fixture data stripped. Form validation is a small dependency-free function shared by the browser and the reference handler. An output test fails if schema-library internals appear in client JS.

## ADR-8 — Browser-only values via `useSyncExternalStore`

"Open now", upcoming versus past events, and URL filters depend on the visitor's clock or URL. They are read through `useSyncExternalStore` with a server snapshot, so prerendered HTML and the first client render match, and no time-sensitive claim is baked into static HTML.

## Patterns deliberately avoided

- Lists or titles rendered only in the browser.
- Forms that show success without a verified 2xx response.
- Sitemaps or canonicals pointing at a domain the build does not own.
- Hard-coded ratings or review counts.
- The same fact (hours, phone, address) maintained in several places.
- Paid API keys behind unauthenticated endpoints.
- Rate limits keyed on raw `x-forwarded-for`.
- Immutable caching for un-hashed assets.
- Tests that CI doesn't run.
