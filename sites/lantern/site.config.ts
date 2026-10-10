import { defineSite } from "../../src/core/define-site";
import { LANTERN_FIXTURE } from "./catalog.fixture";

/**
 * EXAMPLE 2 — Collectibles / gaming store (fictional).
 * Demonstrates catalog + product pages behind a provider interface, an events
 * calendar with detail pages, store news, and hours from one source.
 */
const DEMO_SOURCE = "Fictional demo content (Forge-CT template example)";

export default defineSite({
  id: "lantern",
  family: "retail-hobby",
  demo: true,
  brand: { name: "Lantern & Lair Games", shortName: "Lantern & Lair", tagline: "Cards, boards and a table for you.", monogram: "L&" },
  business: {
    schemaType: "HobbyShop",
    description: "Game store with trading card singles and sealed product, board games, miniatures supplies and weekly play nights in Port Merrow.",
    phone: { value: "(555) 010-0177", status: "demo", source: DEMO_SOURCE },
    email: { value: "hello@lanternlair.example.com", status: "demo", source: DEMO_SOURCE },
    address: {
      value: { street: "201 Wick Street", locality: "Port Merrow", region: "CT", postalCode: "06000", country: "US" },
      status: "demo",
      source: DEMO_SOURCE,
    },
    hours: {
      value: {
        timezone: "America/New_York",
        days: [
          { day: "mon", ranges: [] },
          { day: "tue", ranges: [{ opens: "12:00", closes: "20:00" }] },
          { day: "wed", ranges: [{ opens: "12:00", closes: "20:00" }] },
          { day: "thu", ranges: [{ opens: "12:00", closes: "22:00" }] },
          { day: "fri", ranges: [{ opens: "12:00", closes: "23:00" }] },
          { day: "sat", ranges: [{ opens: "10:00", closes: "23:00" }] },
          { day: "sun", ranges: [{ opens: "11:00", closes: "18:00" }] },
        ],
        note: "Late nights on event days.",
      },
      status: "demo",
      source: DEMO_SOURCE,
    },
    social: [{ label: "Community chat", href: { value: "https://chat.example.com/lantern-lair", status: "demo", source: DEMO_SOURCE } }],
  },
  theme: {
    colorScheme: "dark",
    colors: {
      bg: "#121016",
      surface: "#1d1a24",
      surfaceAlt: "#26222f",
      ink: "#f4efe6",
      muted: "#b8b0c4",
      border: "#4a4357",
      accent: "#f2b33d",
      accentInk: "#1a1306",
      focus: "#7fd4ff",
      success: "#6fdc8c",
      danger: "#ff8a7a",
    },
    fonts: {
      heading: 'ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono", Menlo, Consolas, monospace',
      body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      label: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace',
    },
    headingCase: "uppercase",
    headingWeight: 800,
    headingTracking: "0.02em",
    radius: { sm: "2px", md: "4px", lg: "6px", pill: "4px" },
    shadow: "hard",
    density: "compact",
    maxWidth: "80rem",
  },
  header: { variant: "standard", cta: { label: "This week's events", href: "/events/", variant: "primary" } },
  nav: [
    { label: "Shop", href: "/shop/" },
    { label: "Events", href: "/events/" },
    { label: "News", href: "/news/" },
    { label: "Visit", href: "/visit/" },
  ],
  footer: {
    blurb: "A fictional game store used to demonstrate the Forge-CT retail and hobby template.",
    columns: [
      {
        heading: "Store",
        links: [
          { label: "Hours & directions", href: "/visit/" },
          { label: "Ask us to hold an item", href: "/visit/#ask" },
        ],
      },
    ],
    legal: "Demo content only. Game and product names are invented.",
  },
  forms: {
    contact: {
      provider: { provider: "demo" },
      topics: ["Hold an item", "Buying or trading cards", "Events & tournaments", "Something else"],
      submitLabel: "Send to the store",
      privacyNote: "We only use your details to answer this message. Demo: this form validates but sends nothing.",
    },
  },
  catalog: {
    provider: { provider: "fixture", items: LANTERN_FIXTURE, label: "Sample inventory — not real stock" },
    basePath: "/shop/",
    inquiryHref: "/visit/#ask",
    currency: "USD",
    categories: [
      { id: "singles", label: "Card singles" },
      { id: "sealed", label: "Sealed product" },
      { id: "board-games", label: "Board games & RPGs" },
      { id: "hobby", label: "Paint & hobby" },
      { id: "accessories", label: "Accessories" },
    ],
  },
  events: {
    basePath: "/events/",
    items: [
      {
        slug: "friday-night-draft-2026-09-25",
        title: "Friday Night Draft",
        startsAt: "2026-09-25T18:30:00-04:00",
        endsAt: "2026-09-25T22:30:00-04:00",
        category: "Tournament",
        summary: "Three-round booster draft. Prizes in store credit.",
        entryFeeCents: 1500,
        capacity: 24,
      },
      {
        slug: "starfall-prerelease-2026-10-17",
        title: "Starfall Drakes Prerelease",
        startsAt: "2026-10-17T12:00:00-04:00",
        endsAt: "2026-10-17T18:00:00-04:00",
        category: "Prerelease",
        summary: "Sealed-deck prerelease with the Starfall Drakes kit. Kit included in entry.",
        details: ["Bring sleeves; basic resources provided.", "Check-in opens at 11:30."],
        entryFeeCents: 3000,
        capacity: 32,
      },
      {
        slug: "board-game-night-2026-10-22",
        title: "Open Board Game Night",
        startsAt: "2026-10-22T18:00:00-04:00",
        endsAt: "2026-10-22T22:00:00-04:00",
        category: "Casual",
        summary: "Borrow anything from the demo library and find a table. Teaching on request.",
        entryFeeCents: null,
      },
      {
        slug: "paint-and-take-2026-10-25",
        title: "Paint & Take: Your First Miniature",
        startsAt: "2026-10-25T13:00:00-04:00",
        endsAt: "2026-10-25T15:00:00-04:00",
        category: "Workshop",
        summary: "Beginner painting workshop. Miniature, paints and brushes provided.",
        entryFeeCents: 1000,
        capacity: 12,
      },
      {
        slug: "league-night-2026-10-29",
        title: "Standard League Night",
        startsAt: "2026-10-29T18:30:00-04:00",
        category: "League",
        summary: "Weekly constructed league. Cancelled this week for inventory.",
        entryFeeCents: 500,
        status: "cancelled",
      },
      {
        slug: "friday-night-draft-2026-11-06",
        title: "Friday Night Draft",
        startsAt: "2026-11-06T18:30:00-05:00",
        endsAt: "2026-11-06T22:30:00-05:00",
        category: "Tournament",
        summary: "Three-round booster draft. Prizes in store credit.",
        entryFeeCents: 1500,
        capacity: 24,
      },
    ],
  },
  posts: {
    basePath: "/news/",
    items: [
      {
        slug: "prerelease-registration-open",
        title: "Prerelease registration is open",
        publishedAt: "2026-10-01",
        tag: "Events",
        summary: "Seats for the Starfall Drakes prerelease are limited to 32 players. Reserve at the counter.",
        body: [
          "Seats for the Starfall Drakes prerelease are limited to 32 players.",
          "Reserve at the counter or send us a message; we hold seats for 48 hours.",
        ],
      },
      {
        slug: "new-demo-library-games",
        title: "Six new games in the demo library",
        publishedAt: "2026-09-20",
        tag: "Store",
        summary: "Try before you buy: Harbor Lights, Tiny Kingdoms and four more are now on the open-play shelf.",
        body: ["Try before you buy.", "Harbor Lights, Tiny Kingdoms and four more are now on the open-play shelf."],
      },
      {
        slug: "buying-cards-how-it-works",
        title: "Selling us cards: how it works",
        publishedAt: "2026-09-05",
        tag: "Guides",
        summary: "What we look for, how we grade condition, and why we pay more in store credit than cash.",
        body: ["Bring cards in sleeves or a box, sorted if you can.", "We check condition with you at the counter and explain every offer before you decide."],
      },
    ],
  },
  pages: [
    {
      path: "/",
      title: "Lantern & Lair Games | Cards, Board Games & Play Nights",
      description: "Trading card singles and sealed product, board games and hobby supplies, plus weekly tournaments and open game nights in Port Merrow.",
      sections: [
        {
          type: "hero",
          id: "top",
          variant: "poster",
          tone: "default",
          eyebrow: "Port Merrow game store",
          heading: "Cards, boards & a table waiting for you.",
          lede: "Singles and sealed product, board games and paint — and somewhere to play them most nights of the week.",
          ctas: [
            { label: "Browse the shop", href: "/shop/", variant: "primary" },
            { label: "See events", href: "/events/", variant: "secondary" },
          ],
          highlights: ["Weekly drafts", "Open play tables", "Card buying at the counter"],
          art: "grid",
        },
        { type: "catalog", id: "new-in", tone: "alt", heading: "New on the shelf", filters: false, limit: 4, viewAllHref: "/shop/" },
        { type: "events", id: "upcoming", heading: "Coming up", limit: 3, viewAllHref: "/events/" },
        { type: "posts", id: "news", tone: "alt", heading: "Store news", limit: 3, viewAllHref: "/news/" },
        { type: "hours-location", id: "visit", heading: "Visit the store" },
      ],
    },
    {
      path: "/shop/",
      title: "Shop Cards, Board Games & Hobby Supplies | Lantern & Lair",
      description: "Browse card singles, sealed product, board games, paints and accessories. Filter by category or stock and ask us to hold anything.",
      heading: "Shop",
      sections: [
        {
          type: "catalog",
          id: "catalog",
          heading: "Everything in stock online",
          intro: "Online stock is a sample for this demo. Ask us to hold anything you see.",
          filters: true,
        },
      ],
    },
    {
      path: "/events/",
      title: "Events, Tournaments & Game Nights | Lantern & Lair",
      description: "Upcoming tournaments, prereleases, league nights, workshops and open board game nights at Lantern & Lair Games in Port Merrow.",
      heading: "Events",
      sections: [
        { type: "events", id: "calendar", heading: "Upcoming events", intro: "Past events drop off automatically. Times are shown in store time (Eastern)." },
      ],
    },
    {
      path: "/news/",
      title: "Store News | Lantern & Lair Games",
      description: "Announcements from Lantern & Lair Games: event registration, new games in the demo library and guides to selling us cards.",
      heading: "News",
      sections: [{ type: "posts", id: "posts", heading: "Latest from the store" }],
    },
    {
      path: "/visit/",
      title: "Hours, Directions & Contact | Lantern & Lair Games",
      description: "Store hours, address and how to reach Lantern & Lair Games, plus a form to ask us to hold an item or answer a question.",
      heading: "Visit & contact",
      sections: [
        { type: "hours-location", id: "hours", heading: "Hours & location" },
        {
          type: "contact",
          id: "ask",
          tone: "alt",
          heading: "Ask the store",
          intro: "Hold requests are kept for 48 hours.",
          form: "contact",
          showLocation: false,
        },
      ],
    },
  ],
});
