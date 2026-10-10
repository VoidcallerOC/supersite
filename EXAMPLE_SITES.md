# Example Sites

Three fictional sites, one per site family, all built from the same `src/` without changes. Every name, address, phone number (555-01xx, reserved for fiction), email (`*.example.com`), product, event and price is invented and labelled as such on the page. Screenshots from the e2e run are in [`docs/screenshots/`](docs/screenshots/).

| | Harborline Home Services | Lantern & Lair Games | Tallyhook |
|---|---|---|---|
| Family | Local service (`Plumber`) | Retail / hobby (`HobbyShop`) | Product / app landing |
| Pages built | 6 (incl. 404) | 26 (5 pages + 11 products + 6 events + 3 posts + 404) | 6 |
| Colour scheme | Light, warm paper `#f7f4ee`, deep teal accent | Dark `#121016`, amber accent | Light, pure white, indigo accent |
| Headings | Old-style serif, sentence case, 700 | Monospace, UPPERCASE, 800, +0.02em | System sans, 800, −0.035em |
| Shape | 8px buttons, soft shadows | 2–6px corners, hard offset shadows | Pill buttons, 20px cards |
| Density | Comfortable | Compact | Airy |
| Header | Utility bar (open-now + phone) | Standard + "This week's events" CTA | Minimal + "Open the app" CTA |
| Hero | Split: headline + promise checklist | Poster: big type + grid art + tags | Centered + product mock built in HTML |
| Key sections | Features, steps, testimonials placeholder, FAQ, CTA band, hours/area, contact | Catalog teaser, events, news, hours, full catalog with filters, event/product/post detail | Features grid, steps, pricing, FAQ, changelog posts, waitlist form |
| Form | Visit request (5 topics), demo provider | Hold request on /visit/#ask, demo provider | Waitlist, demo provider |
| Catalog | — | Fixture provider, labelled "Sample inventory — not real stock" | — |

## What each example proves

**Harborline (local service)**
- The phone CTA (`$phone`) is a demo fact, so it is shown with a "Demo" tag and **not linked**. The header CTA falls back to "Request a visit".
- Hours, service area and the address come from one place and drive the table, the open-now pill and (in a live build) the JSON-LD.
- The empty testimonials section shows a placeholder instead of invented reviews.
- The FAQ answers deliberately explain which claims the owner must confirm before launch.

**Lantern & Lair (collectibles / gaming)**
- The catalog comes through the provider interface. One fixture item is deliberately invalid (no price); the build drops it and reports `item 11 dropped: priceCents …`.
- Filters (category, search, in stock) sync to the URL and are restored from it; the result count is announced.
- `quantity: null` shows "Ask in store" and `0` shows "Sold out"; stock is never guessed.
- Events are sorted, past events drop off after hydration (the 2026-09-25 draft), a cancelled event is labelled, and recurring events get date-unique titles.
- Product pages say plainly that online checkout is not enabled and offer a hold request instead.

**Tallyhook (product landing)**
- "Open the app" (`$app`) is a demo URL, so every app CTA falls back to the waitlist; the page never links to an app that does not exist.
- The product "screenshot" is HTML/CSS (sharp, themed) labelled "Sample workspace", with no invented usage metrics.
- Plans use integer-cent prices; "Custom" is rendered for `priceCents: null`.
- Uses the `posts` collection as a changelog, showing the editorial building blocks on a product site.

## Isolation and difference checks (automated)

- Each build contains one site: `tests/output/dist.test.ts` asserts no site's HTML or JS contains another site's brand name.
- Each site gets its own hashed theme stylesheet (3 distinct files).
- `tests/unit/site-configs.test.ts` asserts the three themes differ in at least 4 of 7 structural dimensions (scheme, heading font, heading case, shadow, density, radius, header variant), so they are not accent swaps.
- Each site's SEO is its own: titles and descriptions are unique per route, and each site's report sits at `dist/_reports/<id>.json`.

## Known visual limitations (observed in screenshots)

- Lantern's footer uses the `inverse` tone, which on a dark theme becomes a light cream band. It is legible and passes contrast, but it is a stark shift; a dark-theme footer token would be a refinement.
- All imagery is generated placeholder art. Real client photography is the biggest single visual upgrade available and is intentionally not faked.
- Emoji icons in feature cards render differently per OS. Replace them with an icon set per brand if consistency matters.
- Visual quality was judged by looking at screenshots in one browser engine (Chromium). No cross-browser or real-device check was done.
