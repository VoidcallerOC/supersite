import { defineSite } from "../../src/core/define-site";

/**
 * EXAMPLE 1 — Local service business (fictional).
 * Harborline Home Services is invented for this template. Every fact is
 * status "demo", so the build shows a demo banner, never links the fictional
 * phone/address, is noindex, and emits no structured data.
 */
const DEMO_SOURCE = "Fictional demo content (Forge-CT template example)";

export default defineSite({
  id: "harborline",
  family: "local-service",
  demo: true,
  brand: {
    name: "Harborline Home Services",
    shortName: "Harborline",
    tagline: "Plumbing and heating repair, done tidy.",
    monogram: "H",
  },
  business: {
    schemaType: "Plumber",
    description: "Plumbing and heating repair, water heater replacement and boiler service for homes in and around Alder Falls.",
    phone: { value: "(555) 010-0142", status: "demo", source: DEMO_SOURCE },
    email: { value: "office@harborline.example.com", status: "demo", source: DEMO_SOURCE },
    address: {
      value: { street: "14 Ferry Lane", locality: "Alder Falls", region: "CT", postalCode: "06000", country: "US" },
      status: "demo",
      source: DEMO_SOURCE,
    },
    hours: {
      value: {
        timezone: "America/New_York",
        days: [
          { day: "mon", ranges: [{ opens: "07:30", closes: "17:00" }] },
          { day: "tue", ranges: [{ opens: "07:30", closes: "17:00" }] },
          { day: "wed", ranges: [{ opens: "07:30", closes: "17:00" }] },
          { day: "thu", ranges: [{ opens: "07:30", closes: "17:00" }] },
          { day: "fri", ranges: [{ opens: "07:30", closes: "16:00" }] },
          { day: "sat", ranges: [{ opens: "09:00", closes: "12:00" }] },
          { day: "sun", ranges: [] },
        ],
        note: "Office hours for calls and scheduling.",
      },
      status: "demo",
      source: DEMO_SOURCE,
    },
    serviceArea: { value: ["Alder Falls", "North Alder", "Kettle Point", "Wren Harbor"], status: "demo", source: DEMO_SOURCE },
  },
  theme: {
    colorScheme: "light",
    colors: {
      bg: "#f7f4ee",
      surface: "#fffdf9",
      surfaceAlt: "#ece6da",
      ink: "#1c2a2e",
      muted: "#4f5d60",
      border: "#cfc6b6",
      accent: "#0e5654",
      accentInk: "#ffffff",
      focus: "#b4451f",
      success: "#1e6b3a",
      danger: "#a3271b",
    },
    fonts: {
      heading: '"Iowan Old Style", "Charter", "Palatino Linotype", Georgia, serif',
      body: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    headingCase: "normal",
    headingWeight: 700,
    headingTracking: "-0.01em",
    radius: { sm: "6px", md: "8px", lg: "14px", pill: "999px" },
    shadow: "soft",
    density: "comfortable",
    maxWidth: "70rem",
  },
  header: { variant: "utility", cta: { label: "Call now", href: "$phone", variant: "primary", fallback: { label: "Request a visit", href: "/contact/" } } },
  nav: [
    { label: "Services", href: "/services/" },
    { label: "Service area", href: "/service-area/" },
    { label: "About", href: "/about/" },
    { label: "Contact", href: "/contact/" },
  ],
  footer: {
    blurb: "A fictional plumbing and heating company used to demonstrate the Forge-CT local-service template.",
    columns: [
      {
        heading: "Help",
        links: [
          { label: "Request a visit", href: "/contact/" },
          { label: "Common questions", href: "/#faq" },
        ],
      },
    ],
    legal: "Demo content only.",
  },
  forms: {
    contact: {
      provider: { provider: "demo" },
      topics: ["Leak or burst pipe", "No heat or hot water", "Water heater replacement", "Boiler service", "Something else"],
      submitLabel: "Request a visit",
      privacyNote: "We use your details only to reply to this request. Demo: this form validates but sends nothing.",
    },
  },
  pages: [
    {
      path: "/",
      title: "Harborline Home Services | Plumbing & Heating in Alder Falls",
      description: "Plumbing and heating repair, water heater replacement and boiler service for homes in Alder Falls. Request a visit online or by phone.",
      sections: [
        {
          type: "hero",
          id: "top",
          variant: "split",
          eyebrow: "Plumbing & heating · Alder Falls",
          heading: "Leaks, no heat, cold showers — sorted by people who wipe their boots.",
          lede: "Book a visit for repairs, water heaters and boiler service. You get a written price before any work starts.",
          ctas: [
            { label: "Request a visit", href: "/contact/", variant: "primary" },
            { label: "See services", href: "/services/", variant: "secondary" },
          ],
          highlights: [
            "Written price before work starts",
            "Arrival window confirmed by text",
            "Floors covered, mess cleared",
            "Old parts shown to you, then recycled",
          ],
        },
        {
          type: "features",
          id: "services",
          tone: "alt",
          eyebrow: "What we fix",
          heading: "Common jobs",
          intro: "Most visits are one of these. Not sure which? Describe it in the request form.",
          columns: 3,
          items: [
            {
              title: "Leaks & burst pipes",
              body: "Find the source, stop the water, repair the run and check for damage behind the wall.",
              icon: "💧",
              href: "/services/#repairs",
            },
            {
              title: "Water heaters",
              body: "Repair or replace tank and tankless units, including permits where required.",
              icon: "🔥",
              href: "/services/#water-heaters",
            },
            { title: "Boiler service", body: "Annual cleaning, pressure checks and repairs for gas and oil boilers.", icon: "🛠️", href: "/services/#heating" },
          ],
        },
        {
          type: "steps",
          id: "how",
          heading: "How a visit works",
          steps: [
            { title: "Tell us what's wrong", body: "Use the form or call. Photos help." },
            { title: "Get a time window", body: "We confirm a two-hour arrival window." },
            { title: "Approve the price", body: "You see a written price before we start." },
            { title: "Done and tidy", body: "We test the fix with you and clean up." },
          ],
        },
        { type: "testimonials", id: "reviews", tone: "alt", heading: "What customers say", items: [] },
        {
          type: "faq",
          id: "faq",
          heading: "Common questions",
          items: [
            {
              q: "Do you charge to come out?",
              a: "This is a demo site, so there is no real pricing. A live site would state the call-out fee here exactly as the owner confirms it.",
            },
            { q: "Do you handle emergencies?", a: "Only claim emergency or 24/7 service once the owner confirms someone really answers at all hours." },
            {
              q: "Which towns do you cover?",
              a: "See the service area page. The list comes from one place in the site config, so it never disagrees with itself.",
            },
          ],
        },
        {
          type: "cta-band",
          id: "book",
          tone: "accent",
          heading: "Water where it shouldn't be?",
          body: "Shut off the main valve if you can, then request a visit.",
          ctas: [{ label: "Request a visit", href: "/contact/", variant: "primary" }],
        },
      ],
    },
    {
      path: "/services/",
      title: "Services | Harborline Home Services",
      description: "Leak and pipe repair, water heater repair and replacement, and boiler service for homes in Alder Falls and nearby towns.",
      heading: "Services",
      sections: [
        {
          type: "features",
          id: "repairs",
          heading: "Plumbing repairs",
          columns: 2,
          items: [
            { title: "Leak detection", body: "Track down hidden leaks before they turn into ceiling stains." },
            { title: "Pipe repair & repiping", body: "Copper, PEX and drain lines repaired or replaced." },
            { title: "Fixtures", body: "Faucets, toilets, shut-off valves and supply lines." },
            { title: "Drains", body: "Slow and blocked drains cleared without harsh chemicals." },
          ],
        },
        {
          type: "features",
          id: "water-heaters",
          tone: "alt",
          heading: "Water heaters",
          columns: 2,
          items: [
            { title: "Repair", body: "Thermostats, elements, igniters and relief valves." },
            { title: "Replacement", body: "Like-for-like or an upgrade, sized to your household." },
          ],
        },
        {
          type: "features",
          id: "heating",
          heading: "Heating",
          columns: 2,
          items: [
            { title: "Boiler service", body: "Cleaning, combustion check and safety controls." },
            { title: "Radiators", body: "Bleeding, balancing, valves and leaks." },
          ],
        },
        {
          type: "cta-band",
          id: "book",
          tone: "inverse",
          heading: "Ready to book?",
          ctas: [{ label: "Request a visit", href: "/contact/", variant: "primary" }],
        },
      ],
    },
    {
      path: "/service-area/",
      title: "Service Area & Hours | Harborline Home Services",
      description: "Towns Harborline serves, office hours and how to reach the office. Hours and towns come from a single source so they always match.",
      heading: "Service area & hours",
      sections: [{ type: "hours-location", id: "where", heading: "Where and when", intro: "We visit homes in the towns listed below." }],
    },
    {
      path: "/about/",
      title: "About | Harborline Home Services",
      description: "About Harborline, a fictional plumbing and heating company used to demonstrate how a local-service site is configured.",
      heading: "About Harborline",
      sections: [
        {
          type: "rich-text",
          id: "story",
          heading: "A demo company",
          paragraphs: [
            "Harborline is fictional. On a real site this page holds the owner's own story, licences and insurance details — each one confirmed before launch.",
            "The template keeps those facts in the site config with a status and a source, so a claim like “licensed and insured” cannot reach the page until someone has checked it.",
          ],
        },
      ],
    },
    {
      path: "/contact/",
      title: "Request a Visit | Harborline Home Services",
      description: "Request a plumbing or heating visit from Harborline. Tell us what is wrong and when you are home; we confirm an arrival window.",
      heading: "Request a visit",
      sections: [{ type: "contact", id: "request", heading: "Tell us what's going on", intro: "We reply during office hours.", form: "contact" }],
    },
  ],
});
