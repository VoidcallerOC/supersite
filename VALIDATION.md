# Validation

These checks were run on the exact files in this repository's first commit, on 2026-10-10, with Node v22.22.0, npm 10.9.4 and Chromium (Playwright 1.56). Nothing contacted an external service except the npm registry during installation.

| Command | Result |
|---|---|
| `npm ci --ignore-scripts` | ✅ exit 0. No dependency declares a preinstall, install or postinstall script. |
| `npm run typecheck` (`tsc --noEmit`, strict) | ✅ 0 errors |
| `npm run lint` (ESLint 9: typescript-eslint, react-hooks, jsx-a11y strict) | ✅ 0 problems |
| `npm run format:check` (Prettier, code files) | ✅ |
| `npm run test` (Vitest; jsdom for components) | ✅ 86 / 86 in 10 files |
| `npm run build:all` | ✅ harborline 6 pages · lantern 26 pages · tallyhook 6 pages |
| `npm run test:output` (inspects `dist/`) | ✅ 37 / 37 |
| `npx playwright test` (1280px desktop + 375px mobile, axe-core) | ✅ 51 passed, 1 skipped (the mobile-menu test is skipped on desktop by design) |

`npm run check` runs the typecheck, lint, format, unit and output steps in sequence; it exited 0.

## What the tests cover

- **Unit (72):**
  - config validation, plus rejection of fake testimonials, duplicate ids and titles, and missing h1
  - WCAG contrast for every theme
  - fact visibility, and demo facts never being linked
  - indexing rules, robots and sitemap
  - JSON-LD built only from confirmed facts, with `</script>` escaping
  - the launch gate
  - open-now in the business timezone (including DST)
  - integer-cent money
  - catalog providers (ok / empty / unavailable / timeout)
  - form submission outcomes and the reference handler with its rate limiter
- **Component (14):**
  - mobile menu ARIA and Escape behaviour
  - form error summary and focus, demo / failure / success outcomes
  - catalog filters, URL state and the empty / unavailable states
  - testimonial placeholder
  - exactly one h1, a `<main>` and a skip link on every route of every example
- **Build output (33):**
  - unique titles and descriptions
  - noindex everywhere in demos, with no canonical and no JSON-LD
  - content present in the HTML, valid hydration data
  - every internal link and `#anchor` resolves
  - no links to fictional facts
  - no cross-site content in any bundle
  - crawl blocks, 404 page, JS and CSS budgets
  - the production build of a demo is refused without touching existing output
- **Browser (51):**
  - 17 pages × 2 viewports with zero serious or critical axe violations and no horizontal scroll
  - skip link and visible focus
  - keyboard mobile menu
  - contact form validation and honest demo result
  - catalog filter and URL restore
  - past and cancelled events
  - JavaScript disabled
  - reduced motion

## Measured output

| Site | HTML pages | JS (gzip) | Indexable |
|---|---|---|---|
| harborline | 6 | 83,569 B | no (demo) |
| lantern | 26 | 83,634 B | no (demo) |
| tallyhook | 6 | 83,033 B | no (demo) |

## Not verified

- **Hosting:** no deployment, so the generated `vercel.json` headers have not been served by a real host.
- **Live build path:** the indexable production path is covered by unit tests on a test-only config, not by an end-to-end launched site.
- **Live services:** the `http` catalog provider and the `endpoint` form provider were tested with mocks only.
- **Browsers and devices:** only Chromium was tested; Firefox, WebKit and real devices were not.
- **Screen readers and accessibility certification:** no manual screen-reader testing was done, and no accessibility certification is claimed.
- **Performance:** no Lighthouse or field performance data.
