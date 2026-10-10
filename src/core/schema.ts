import { z } from "zod";

/*
 * Site configuration schema.
 *
 * Every client site is one `site.config.ts` file validated against this schema
 * at build time. Content, presentation (theme) and integrations live in
 * separate keys so they can change independently.
 */

// ---------------------------------------------------------------------------
// Facts: anything a customer might rely on (phone, address, hours, prices).
// ---------------------------------------------------------------------------

export const factStatus = z.enum([
  /** Verified with the owner or a primary source. May be published and put in structured data. */
  "confirmed",
  /** Believed true but not verified. Shown with a "to confirm" tag in demo builds, hidden in live builds. */
  "unconfirmed",
  /** Invented for a demo. Never valid in a live build. */
  "demo",
]);
export type FactStatus = z.infer<typeof factStatus>;

export const fact = <T extends z.ZodType>(value: T) =>
  z.object({
    value,
    status: factStatus,
    /** Where the value came from, e.g. "Owner phone call 2026-09-30" or "Fictional demo content". */
    source: z.string().min(3),
  });

export type Fact<T> = { value: T; status: FactStatus; source: string };

const dayKey = z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
export type DayKey = z.infer<typeof dayKey>;

const timeHHMM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24h HH:MM");

export const weeklyHours = z.object({
  timezone: z.string().min(3),
  days: z.array(
    z.object({
      day: dayKey,
      /** Empty list = closed that day. */
      ranges: z.array(z.object({ opens: timeHHMM, closes: timeHHMM })),
    }),
  ),
  note: z.string().optional(),
});
export type WeeklyHours = z.infer<typeof weeklyHours>;

export const address = z.object({
  street: z.string(),
  locality: z.string(),
  region: z.string(),
  postalCode: z.string(),
  country: z.string().default("US"),
});
export type Address = z.infer<typeof address>;

// ---------------------------------------------------------------------------
// Theme: design tokens a client can override without touching components.
// ---------------------------------------------------------------------------

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use 6-digit hex colors so contrast can be checked");

export const theme = z.object({
  colorScheme: z.enum(["light", "dark"]),
  colors: z.object({
    bg: hex,
    surface: hex,
    surfaceAlt: hex,
    ink: hex,
    muted: hex,
    border: hex,
    accent: hex,
    /** Text color used on top of `accent`. */
    accentInk: hex,
    focus: hex,
    success: hex,
    danger: hex,
  }),
  fonts: z.object({
    heading: z.string(),
    body: z.string(),
    /** Optional mono/label font for eyebrow text and data. */
    label: z.string().optional(),
  }),
  headingCase: z.enum(["normal", "uppercase"]).default("normal"),
  headingWeight: z.number().int().min(400).max(900).default(700),
  headingTracking: z.string().default("-0.01em"),
  radius: z.object({ sm: z.string(), md: z.string(), lg: z.string(), pill: z.string() }),
  shadow: z.enum(["none", "soft", "hard"]),
  density: z.enum(["compact", "comfortable", "airy"]),
  maxWidth: z.string().default("72rem"),
});
export type Theme = z.infer<typeof theme>;

// ---------------------------------------------------------------------------
// Links and calls to action.
// ---------------------------------------------------------------------------

export const cta = z.object({
  label: z.string().min(1),
  /** Internal path ("/contact/"), anchor ("#quote"), or special targets resolved from facts. */
  href: z.union([z.string().min(1), z.enum(["$phone", "$email", "$directions", "$app"])]),
  variant: z.enum(["primary", "secondary", "ghost"]).default("primary"),
  /** Used when `href` points at a fact that cannot be linked (missing, demo-only or unconfirmed in a live build). */
  fallback: z.object({ label: z.string(), href: z.string() }).optional(),
});
export type Cta = z.infer<typeof cta>;

// ---------------------------------------------------------------------------
// Sections. Each `type` maps to one component in src/sections/registry.tsx.
// ---------------------------------------------------------------------------

const sectionBase = {
  /** Anchor id; also used as a stable key. */
  id: z.string().regex(/^[a-z0-9-]+$/),
  /** Hide without deleting the content. */
  hidden: z.boolean().default(false),
  /** Background treatment. */
  tone: z.enum(["default", "alt", "accent", "inverse"]).default("default"),
};

const heroSection = z.object({
  ...sectionBase,
  type: z.literal("hero"),
  variant: z.enum(["split", "poster", "centered"]),
  eyebrow: z.string().optional(),
  heading: z.string(),
  lede: z.string(),
  ctas: z.array(cta).max(2),
  /** Short factual bullets shown beside the heading (split variant). */
  highlights: z.array(z.string()).max(4).default([]),
  art: z.enum(["none", "grid", "rings", "product-mock"]).default("none"),
  /**
   * Optional document-style card beside the heading (split variant): a sample
   * quote, menu, schedule or spec sheet. Shown instead of the highlights card;
   * highlights then render as a compact list under the calls to action.
   */
  panel: z
    .object({
      eyebrow: z.string(),
      title: z.string(),
      meta: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .max(4)
        .default([]),
      rows: z
        .array(z.object({ label: z.string(), detail: z.string().optional(), value: z.string() }))
        .min(1)
        .max(6),
      total: z.object({ label: z.string(), value: z.string() }).optional(),
      footnote: z.string().optional(),
    })
    .optional(),
});

const featureGridSection = z.object({
  ...sectionBase,
  type: z.literal("features"),
  eyebrow: z.string().optional(),
  heading: z.string(),
  intro: z.string().optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  items: z
    .array(
      z.object({
        title: z.string(),
        body: z.string(),
        icon: z.string().optional(),
        href: z.string().optional(),
        /** e.g. "From $129" — only for real or clearly demo pricing. */
        meta: z.string().optional(),
      }),
    )
    .min(1),
});

const stepsSection = z.object({
  ...sectionBase,
  type: z.literal("steps"),
  heading: z.string(),
  intro: z.string().optional(),
  steps: z.array(z.object({ title: z.string(), body: z.string() })).min(2),
});

const testimonialsSection = z.object({
  ...sectionBase,
  type: z.literal("testimonials"),
  heading: z.string(),
  /**
   * Real reviews only. `source` and `permission` are required so a
   * testimonial can never be invented silently.
   */
  items: z.array(
    z.object({
      quote: z.string().min(10),
      author: z.string(),
      source: z.string().min(5),
      permission: z.literal(true),
    }),
  ),
});

const ctaBandSection = z.object({
  ...sectionBase,
  type: z.literal("cta-band"),
  heading: z.string(),
  body: z.string().optional(),
  ctas: z.array(cta).min(1).max(2),
});

const faqSection = z.object({
  ...sectionBase,
  type: z.literal("faq"),
  heading: z.string(),
  items: z.array(z.object({ q: z.string(), a: z.string() })).min(1),
});

const contactSection = z.object({
  ...sectionBase,
  type: z.literal("contact"),
  heading: z.string(),
  intro: z.string().optional(),
  form: z.string().default("contact"),
  showLocation: z.boolean().default(true),
});

const hoursLocationSection = z.object({
  ...sectionBase,
  type: z.literal("hours-location"),
  heading: z.string(),
  intro: z.string().optional(),
});

const catalogSection = z.object({
  ...sectionBase,
  type: z.literal("catalog"),
  heading: z.string(),
  intro: z.string().optional(),
  /** Show filters (category, search, in-stock). */
  filters: z.boolean().default(true),
  /** Limit for teaser use on the home page; omit for the full catalog. */
  limit: z.number().int().positive().optional(),
  viewAllHref: z.string().optional(),
});

const eventsSection = z.object({
  ...sectionBase,
  type: z.literal("events"),
  heading: z.string(),
  intro: z.string().optional(),
  limit: z.number().int().positive().optional(),
  viewAllHref: z.string().optional(),
});

const pricingSection = z.object({
  ...sectionBase,
  type: z.literal("pricing"),
  heading: z.string(),
  intro: z.string().optional(),
  note: z.string().optional(),
  plans: z
    .array(
      z.object({
        name: z.string(),
        priceCents: z.number().int().nonnegative().nullable(),
        period: z.string().optional(),
        summary: z.string(),
        features: z.array(z.string()),
        cta: cta,
        featured: z.boolean().default(false),
      }),
    )
    .min(1),
});

const richTextSection = z.object({
  ...sectionBase,
  type: z.literal("rich-text"),
  heading: z.string(),
  /** Paragraphs of plain text. No HTML is accepted, so nothing can be injected. */
  paragraphs: z.array(z.string()).min(1),
});

const postsSection = z.object({
  ...sectionBase,
  type: z.literal("posts"),
  heading: z.string(),
  intro: z.string().optional(),
  limit: z.number().int().positive().optional(),
  viewAllHref: z.string().optional(),
});

export const section = z.discriminatedUnion("type", [
  heroSection,
  featureGridSection,
  stepsSection,
  testimonialsSection,
  ctaBandSection,
  faqSection,
  contactSection,
  hoursLocationSection,
  catalogSection,
  eventsSection,
  pricingSection,
  richTextSection,
  postsSection,
]);
export type Section = z.infer<typeof section>;
export type SectionType = Section["type"];
export type SectionOf<T extends SectionType> = Extract<Section, { type: T }>;

// ---------------------------------------------------------------------------
// Content collections rendered as list + detail pages.
// ---------------------------------------------------------------------------

export const eventItem = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  /** ISO 8601 with offset, e.g. 2026-11-14T18:00:00-05:00. */
  startsAt: z.string().datetime({ offset: true }),
  endsAt: z.string().datetime({ offset: true }).optional(),
  category: z.string(),
  summary: z.string(),
  details: z.array(z.string()).default([]),
  entryFeeCents: z.number().int().nonnegative().nullable().default(null),
  capacity: z.number().int().positive().optional(),
  status: z.enum(["scheduled", "cancelled"]).default("scheduled"),
});
export type EventItem = z.infer<typeof eventItem>;

export const postItem = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  publishedAt: z.string().date(),
  summary: z.string(),
  body: z.array(z.string()).min(1),
  tag: z.string().optional(),
});
export type PostItem = z.infer<typeof postItem>;

// ---------------------------------------------------------------------------
// Integrations. Every provider has a credential-free mode.
// ---------------------------------------------------------------------------

export const formProvider = z.discriminatedUnion("provider", [
  /** Validates and then tells the visitor plainly that nothing was sent. */
  z.object({ provider: z.literal("demo") }),
  /** POSTs JSON to an endpoint you control (see integrations/forms/contact-handler.ts). */
  z.object({ provider: z.literal("endpoint"), url: z.string().min(1) }),
  /** Opens the visitor's email app with a prefilled message. */
  z.object({ provider: z.literal("mailto"), to: z.email() }),
]);
export type FormProvider = z.infer<typeof formProvider>;

export const formConfig = z.object({
  provider: formProvider,
  topics: z.array(z.string()).min(1),
  submitLabel: z.string().default("Send message"),
  /** Shown under the form. State response time only if the owner confirmed it. */
  privacyNote: z.string(),
});
export type FormConfig = z.infer<typeof formConfig>;

export const catalogProvider = z.discriminatedUnion("provider", [
  z.object({ provider: z.literal("none") }),
  /** Static fixture data bundled with the site. Always labelled as sample data in demo builds. */
  z.object({
    provider: z.literal("fixture"),
    /** Validated item by item at load time; invalid items are dropped and reported. */
    items: z.array(z.unknown()),
    /** Label shown to visitors, e.g. "Sample inventory for this demo". */
    label: z.string(),
  }),
  /** Read-only HTTP JSON source fetched at build time. */
  z.object({
    provider: z.literal("http"),
    url: z.string().min(1),
    timeoutMs: z.number().int().positive().default(8000),
  }),
]);
export type CatalogProviderConfig = z.infer<typeof catalogProvider>;

// ---------------------------------------------------------------------------
// The site.
// ---------------------------------------------------------------------------

export const page = z.object({
  path: z.string().regex(/^\/([a-z0-9-]+\/)*$/, 'Use "/" or "/segment/" with a trailing slash'),
  title: z.string().min(3).max(70),
  description: z.string().min(50).max(170),
  /** Heading for the page when the first section is not a hero. */
  heading: z.string().optional(),
  sections: z.array(section).min(1),
});
export type Page = z.infer<typeof page>;

export const siteConfig = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  family: z.enum(["local-service", "retail-hobby", "editorial", "product"]),
  /**
   * Demo builds: banner on every page, forced noindex, "to confirm" tags,
   * no structured data from unconfirmed facts. Must be false to launch.
   */
  demo: z.boolean(),
  /** Canonical origin, e.g. "https://example.com". Required for a live build. */
  origin: z.url().optional(),
  locale: z.string().default("en-US"),
  brand: z.object({
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    /** One or two letters for the generated mark. */
    monogram: z.string().min(1).max(2),
  }),
  business: z.object({
    schemaType: z.string().default("LocalBusiness"),
    description: z.string(),
    phone: fact(z.string()).optional(),
    email: fact(z.email()).optional(),
    address: fact(address).optional(),
    hours: fact(weeklyHours).optional(),
    serviceArea: fact(z.array(z.string())).optional(),
    appUrl: fact(z.url()).optional(),
    social: z.array(z.object({ label: z.string(), href: fact(z.url()) })).default([]),
  }),
  theme,
  header: z.object({
    variant: z.enum(["utility", "standard", "minimal"]),
    cta: cta.optional(),
  }),
  nav: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .min(1)
    .max(7),
  footer: z.object({
    blurb: z.string(),
    columns: z.array(z.object({ heading: z.string(), links: z.array(z.object({ label: z.string(), href: z.string() })) })),
    legal: z.string().optional(),
  }),
  forms: z.record(z.string(), formConfig).default({}),
  catalog: z
    .object({
      provider: catalogProvider,
      basePath: z.string().default("/shop/"),
      /** Where "Ask us to hold it" on product pages points. */
      inquiryHref: z.string().default("/contact/"),
      currency: z.string().default("USD"),
      categories: z.array(z.object({ id: z.string(), label: z.string() })),
    })
    .optional(),
  events: z.object({ basePath: z.string().default("/events/"), items: z.array(eventItem) }).optional(),
  posts: z.object({ basePath: z.string().default("/news/"), items: z.array(postItem) }).optional(),
  analytics: z.object({ provider: z.enum(["none"]) }).default({ provider: "none" }),
  pages: z.array(page).min(1),
});

export type SiteConfigInput = z.input<typeof siteConfig>;
export type SiteConfig = z.infer<typeof siteConfig>;

// ---------------------------------------------------------------------------
// Catalog data shape returned by providers.
// ---------------------------------------------------------------------------

export const product = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  category: z.string(),
  priceCents: z.number().int().nonnegative(),
  /** null = not tracked; the UI then says "Ask in store" instead of guessing. */
  quantity: z.number().int().nonnegative().nullable(),
  condition: z.string().optional(),
  summary: z.string(),
  details: z.array(z.string()).default([]),
  /** Generated art key; replace with a real image path when the owner supplies photos. */
  art: z.string().default("card"),
  image: z.object({ src: z.string(), alt: z.string().min(3), width: z.number(), height: z.number() }).optional(),
});
export type Product = z.infer<typeof product>;
