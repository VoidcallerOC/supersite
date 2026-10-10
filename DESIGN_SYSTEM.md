# Design System

One component set, re-themed per client through tokens. Components never contain client colours, fonts or radii; they read CSS variables generated from `site.theme`.

## Token pipeline

```
sites/<id>/site.config.ts  →  theme (typed, zod-validated)
        → src/core/theme-css.ts   →  :root { --c-bg … --section-y … }   (written to assets/theme-<hash>.css)
        → src/styles/app.css @theme inline  →  Tailwind utilities: bg-surface, text-muted, rounded-md, font-heading …
```

The theme ships as an external, hashed stylesheet rather than inline `<style>`, so the CSP can stay `style-src 'self'`.

## Tokens

| Group | Token (theme key → CSS var → utility) | Notes |
|---|---|---|
| Colour roles | `bg`, `surface`, `surfaceAlt`, `ink`, `muted`, `border`, `accent`, `accentInk`, `focus`, `success`, `danger` → `--c-*` → `bg-bg`, `text-ink`, `bg-accent`, `text-accent-ink`… | Roles, not hues. 6-digit hex is required so contrast can be computed. |
| Typography | `fonts.heading`, `fonts.body`, `fonts.label` → `--f-*` → `font-heading`, `font-body`, `font-label` | System font stacks by default: zero font requests, no layout shift. Add self-hosted fonts per client if the brand needs them (`font-src 'self'`). |
| Heading style | `headingCase`, `headingWeight`, `headingTracking` | Changes brand voice without touching components (Lantern: uppercase mono 800; Tallyhook: tight −0.035em). |
| Type scale | Fluid `clamp()` for h1/h2/h3 in `app.css` | h1 2.25→4.25rem, h2 1.75→2.75rem, h3 1.15→1.375rem; body 17px / 1.6. |
| Radii | `radius.sm/md/lg/pill` → `--r-*` → `rounded-sm/md/lg/pill` | Tallyhook sets `md: 999px` for pill buttons. |
| Elevation | `shadow: none | soft | hard` → `--shadow-card` | `hard` = offset solid shadow in the ink colour (retail/gaming look). |
| Spacing rhythm | `density: compact | comfortable | airy` → `--section-y` | Vertical section padding; horizontal gutter is fixed at 16px mobile / 24px ≥640px. |
| Layout | `maxWidth` → `--max-w` | Content column width. |
| Breakpoints | Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280 | Mobile-first; nav collapses below `lg`. |
| Colour scheme | `colorScheme: light | dark` | Sets CSS `color-scheme`. One scheme per brand. No toggle, because none of the three families needs one. |

## Component rules

- **Buttons** (`.btn-primary / -secondary / -ghost`): 44px minimum touch target. Primary uses `accent` / `accentInk`. On `accent` and `inverse` sections primary buttons invert automatically.
- **Cards** (`.card`): surface, border, `--r-lg`, `--shadow-card`. A whole-card click target uses a stretched link (`after:absolute after:inset-0`) on the heading link, so there is one link per card and screen readers hear its name once.
- **Forms** (`.field-label`, `.field-input`, `.field-hint`, `.field-error`):
  - Every input has a visible `<label>`.
  - Errors are linked with `aria-describedby`, and invalid fields get `aria-invalid`.
  - On submit, an error summary (`role="alert"`) receives focus and links to each field.
  - Input borders use `muted` (≥4.5:1) rather than `border` for visibility.
- **Tags** (`.tag`): small outlined labels for stock, status, "Demo" and "To confirm". They are text, never colour alone.
- **Section tones:** `default`, `alt`, `accent`, `inverse`. Focus outlines switch to `currentColor` on accent/inverse backgrounds.
- **States** (`StatusMessage`): one component for info, empty, error, success and loading. Errors use `role="alert"`, the rest `role="status"`. Each has an icon plus a text title, never colour alone.
- **Imagery:** decorative SVG art (`Art.tsx`) is `aria-hidden`. Real images require `alt`, `width` and `height` in the schema, with `loading="lazy"` in lists. There are no stock photos and nothing borrowed from other clients.

## Accessibility expectations (enforced)

| Requirement | Where enforced |
|---|---|
| WCAG AA contrast for every text pair in every theme | `tests/unit/site-configs.test.ts` (`contrastChecks`) |
| One `<h1>`, `<main>`, skip link on every route | `tests/components/sections.test.tsx`; e2e |
| No serious/critical axe violations (WCAG 2.0/2.1/2.2 A+AA rule sets) on 17 pages × 2 viewports | `e2e/sites.spec.ts` |
| Keyboard: skip link first, visible focus, menu opens with Enter, closes with Escape and returns focus | component + e2e tests |
| Works without JS (content + navigation) | e2e "works without JavaScript" |
| Reduced motion honoured | `app.css` media query; e2e check |
| No horizontal scroll at 375px | e2e on every page |
| Strict jsx-a11y lint rules | `eslint.config.js` |

None of this is an accessibility certification. Automated checks catch only part of WCAG. Manual screen-reader testing (VoiceOver, NVDA) and a human review are still required before launch (see VALIDATION.md).

## Branding a new client

1. Copy the closest example's `theme` block.
2. Set the brand colours to roles: `accent` is the CTA colour and `accentInk` its readable text colour. Keep `ink`/`bg` at 4.5:1 or better.
3. Pick heading and body font stacks. Add self-hosted font files only if the brand needs them.
4. Choose `shadow`, `density` and `radius` to match the brand's character. Change at least these plus the fonts: an accent swap alone makes every client look the same.
5. Run `npm test`. The contrast test names any pair that fails.
6. Build and look at it: `npm run build -- --site <id> && npm run preview -- --site <id>`.
