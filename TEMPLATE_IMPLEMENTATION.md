# Template Implementation

## Project structure

```
forge-super-site/
├── sites/                     # one folder per client — the only place client content lives
│   ├── harborline/site.config.ts      # local service (example)
│   ├── lantern/site.config.ts         # gaming store (example)
│   ├── lantern/catalog.fixture.ts     # sample inventory (fictional)
│   └── tallyhook/site.config.ts       # product landing (example)
├── src/
│   ├── core/
│   │   ├── schema.ts          # zod schema: site, theme, facts, sections, collections, integrations
│   │   ├── define-site.ts     # validation + cross-checks (dup ids/titles, h1 source, dangling refs)
│   │   ├── facts.ts           # viewFact / confirmedValue / tel & directions links
│   │   ├── seo.ts             # head tags, JSON-LD, robots, sitemap, indexing rule, launch gate
│   │   ├── routes.ts          # route list (pages + products + events + posts + 404) and meta
│   │   ├── hours.ts           # business-timezone open/closed, schema.org hours
│   │   ├── events.ts, money.ts, theme-css.ts, contrast.ts
│   ├── integrations/
│   │   ├── result.ts          # ProviderResult: ok | empty | unavailable
│   │   ├── catalog/load.ts    # none | fixture | http providers (build time), validation
│   │   ├── catalog/view.ts    # browser-safe filter + stock helpers
│   │   ├── forms/contact-schema.ts   # shared validation (browser + server)
│   │   ├── forms/submit.ts           # demo | endpoint | mailto, honest outcomes
│   │   ├── forms/contact-handler.ts  # reference server handler (not deployed)
│   │   └── analytics.ts       # no-op boundary
│   ├── components/            # Header (mobile nav), Footer, DemoBanner, Breadcrumbs, ContactForm,
│   │                          # LocationCard, OpenNow, Art, ui (CtaLink, SectionShell, StatusMessage…)
│   ├── sections/              # 13 section components + registry.tsx
│   ├── pages/                 # SectionList, PageHeader, Product/Event/Post/404 pages
│   ├── App.tsx                # shell: skip link, banner, header, <main>, footer
│   ├── entry-server.tsx       # build-time API: prepare(), render(), clientSite()
│   ├── entry-client.tsx       # hydration (dev: client render)
│   └── styles/app.css         # Tailwind 4 + token mapping + component classes
├── scripts/build.mjs          # SSR build → launch gate → client build → prerender → robots/sitemap/headers/report
├── scripts/serve.mjs          # local static preview server (127.0.0.1 only)
├── tests/unit, tests/components, tests/output, e2e/
└── docs/screenshots/ (e2e captures)
```

## Implemented features

| Capability | Status | Where |
|---|---|---|
| Config-driven multi-site build | COMPLETE | `sites/*`, `vite.config.ts`, `scripts/build.mjs` |
| Prerendered HTML for every route + hydration | COMPLETE | `entry-server.tsx`, `entry-client.tsx` |
| Section registry (13 types), reorder/hide/tone | COMPLETE | `src/sections/` |
| Detail pages: product, event, post; 404 | COMPLETE | `src/pages/DetailPages.tsx` |
| Design tokens → CSS vars → Tailwind | COMPLETE | `theme-css.ts`, `app.css` |
| Facts with status/source; demo tags; no linking of demo values | COMPLETE | `facts.ts`, `links.ts` |
| Launch gate for production builds | COMPLETE | `seo.ts launchProblems`, `build.mjs` |
| SEO: unique titles, descriptions, canonical (with origin), OG, robots, sitemap, JSON-LD (LocalBusiness/subtype, Product, Event, Article, BreadcrumbList, SoftwareApplication) from confirmed facts | COMPLETE (live path verified by unit tests only; no live site built) | `seo.ts` |
| Indexing controls for demo/preview | COMPLETE | `seo.ts isIndexable`, build output |
| Security headers per site (`vercel.json`) | COMPLETE as a file; **UNVERIFIED on a real host** | `build.mjs` |
| Contact form: validation, error summary, honeypot, demo/endpoint/mailto | COMPLETE | `ContactForm.tsx`, `forms/*` |
| Reference server handler + rate limiter | COMPLETE (unit-tested; not deployed) | `contact-handler.ts` |
| Catalog provider (none/fixture/http), filters in URL, stock labels, empty/unavailable states | COMPLETE | `catalog/*`, `Catalog.tsx` |
| Events with past/upcoming after hydration, cancelled state | COMPLETE | `Events.tsx`, `events.ts` |
| Hours/open-now in business timezone | COMPLETE | `hours.ts`, `OpenNow.tsx` |
| Analytics | Boundary only (provider `none`) | `analytics.ts` |
| CMS adapter | NOT STARTED (config file is the CMS; shapes are CMS-ready) | — |
| Checkout / payments | NOT STARTED (out of scope; see ARCHITECTURE.md, ADR-6) | — |
| Self-hosted fonts / real images pipeline | NOT STARTED (system fonts; image fields supported in schema) | — |
| CI workflow | NOT STARTED (no remote repo authorised; `npm run check` is CI-ready) | — |

## Integration boundaries

See ARCHITECTURE.md, ADR-6. In short:
- Nothing needs credentials to preview.
- Every provider has a credential-free mode, and a failure state the UI renders honestly.
- Live data is fetched at build time, so no key sits on a request path.

## How to add a client site

1. `cp -r sites/harborline sites/<client-id>` (pick the closest family) and set `id: "<client-id>"`.
2. Replace brand, business facts, theme, nav, footer, forms and pages. For each fact, set `status` and `source` honestly:
   - `demo` for placeholders;
   - `unconfirmed` for anything not yet verified with the owner;
   - `confirmed` only with a named source, e.g. `"Owner call 2026-10-12"`.
3. `npm test` checks config validation and contrast. `npm run build -- --site <client-id>` builds. `npm run preview -- --site <client-id>` serves it at http://127.0.0.1:4173.
4. To launch: set `demo: false`, set `origin`, confirm every fact, switch the form to `endpoint` (and deploy a handler) or `mailto`, then run `npm run build -- --site <client-id> --production`. The build lists anything still blocking.

## How to add a section type

1. Add a `z.object({...sectionBase, type: z.literal("my-type"), ...})` to `section` in `src/core/schema.ts`.
2. Create `src/sections/MyType.tsx` taking `SectionProps<"my-type">` and render it inside `SectionShell` for consistent headings and landmarks.
3. Add `"my-type": MyType` to `SECTIONS` in `registry.tsx`. TypeScript fails until you do.
4. Add a unit or component test. Use it in at least one site config, otherwise it isn't needed.

## How to add a live catalog source

Set `catalog.provider` to `{ provider: "http", url: "https://…/items.json", timeoutMs: 8000 }`. The endpoint must return `Product[]` or `{ items: Product[] }` (see `product` in `schema.ts`). Invalid items are dropped and reported in the build output. If the source fails, the shop page renders "Inventory is unavailable right now" and no product pages are generated; the build itself does not fail. For an authenticated or paid source, put a small server-side proxy with auth, caching and rate limits in front of it. Never call it from the browser.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server (client-rendered; `SITE=<id>` selects the site) |
| `npm run build -- --site <id>` / `npm run build:all` | Prerendered build(s) into `dist/<id>` + `dist/_reports/<id>.json` |
| `npm run preview -- --site <id>` | Serve `dist/<id>` on 127.0.0.1:4173 |
| `npm run check` | typecheck → lint → format check → unit/component tests → build all → output tests |
| `npm run test:e2e` | Playwright + axe against the built sites (after `build:all`) |
