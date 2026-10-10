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
      heading: '"Fraunces Variable", "Iowan Old Style", Georgia, serif',
      body: '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    headingCase: "normal",
    headingWeight: 600,
    headingTracking: "-0.02em",
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
    blurb: "Plumbing and heating repair for homes around Alder Falls. Written prices, confirmed arrival windows, tidy work.",
    columns: [
      {
        heading: "Help",
        links: [
          { label: "Request a visit", href: "/contact/" },
          { label: "Common questions", href: "/#faq" },
        ],
      },
    ],
    legal: "Fictional business shown as a template demo.",
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
            "Old parts shown, then recycled",
          ],
          panel: {
            eyebrow: "Sample quote",
            title: "Water heater replacement",
            meta: [
              { label: "Arrival window", value: "Tue, 8–10am" },
              { label: "Technician", value: "Sam R." },
            ],
            rows: [
              { label: "50-gal gas water heater", detail: "Supply and fit, like-for-like", value: "$1,480" },
              { label: "Expansion tank and valves", detail: "Required by code", value: "$185" },
              { label: "Removal and recycling", detail: "Old tank taken away", value: "$60" },
            ],
            total: { label: "Fixed price, approved before work", value: "$1,725" },
            footnote: "Illustrative example. Every visit starts with a written price like this.",
          },
        },
        {
          type: "features",
          id: "services",
          tone: "alt",
          eyebrow: "What we fix",
          heading: "Common jobs",
          intro: "Most visits are one of these. Not sure which? Describe it in the request form and we will tell you.",
          columns: 3,
          items: [
            {
              title: "Leaks & burst pipes",
              body: "Find the source, stop the water, repair the run and check for damage behind the wall.",
              icon: "drop",
              href: "/services/#repairs",
              meta: "Same day when booked by noon",
            },
            {
              title: "Water heaters",
              body: "Repair or replace tank and tankless units, including permits where required.",
              icon: "flame",
              href: "/services/#water-heaters",
              meta: "Most replacements in one visit",
            },
            {
              title: "Boilers & radiators",
              body: "Annual cleaning, pressure checks and repairs for gas and oil boilers and cold radiators.",
              icon: "radiator",
              href: "/services/#heating",
              meta: "Book before the first cold snap",
            },
          ],
        },
        {
          type: "steps",
          id: "how",
          heading: "How a visit works",
          intro: "No surprises: you know who is coming, when, and what it will cost before anything starts.",
          steps: [
            { title: "Tell us what's wrong", body: "Use the form or call. Photos help us bring the right parts." },
            { title: "Get a time window", body: "We text a two-hour arrival window and the technician's name." },
            { title: "Approve the price", body: "You see a written, fixed price before we touch anything." },
            { title: "Done and tidy", body: "We test the fix with you, then clean up and take old parts away." },
          ],
        },
        {
          type: "hours-location",
          id: "area",
          tone: "alt",
          heading: "Where and when we work",
          intro: "Office hours for calls and scheduling, and the towns we cover.",
        },
        {
          type: "faq",
          id: "faq",
          heading: "Common questions",
          items: [
            {
              q: "Do you charge to come out?",
              a: "The visit is included in the written price you approve. If you decide not to go ahead, you pay only the diagnostic fee quoted when you book.",
            },
            {
              q: "How soon can you come?",
              a: "Requests made before noon on a weekday are usually seen the same day. We text an arrival window as soon as a technician is assigned.",
            },
            {
              q: "Which towns do you cover?",
              a: "Alder Falls, North Alder, Kettle Point and Wren Harbor. If you are just outside that area, ask — we can often fit you in.",
            },
            {
              q: "Will you clean up afterwards?",
              a: "Yes. Floors are covered before work starts, and old parts are shown to you and then taken away for recycling.",
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
          eyebrow: "Plumbing",
          heading: "Plumbing repairs",
          intro: "From a dripping valve to a burst pipe in the wall, we find the cause first and fix it properly.",
          columns: 4,
          items: [
            { title: "Leak detection", body: "Track down hidden leaks before they turn into ceiling stains.", icon: "drop" },
            { title: "Pipes & repiping", body: "Copper, PEX and drain lines repaired or replaced.", icon: "pipe" },
            { title: "Fixtures", body: "Faucets, toilets, shut-off valves and supply lines.", icon: "shower" },
            { title: "Drains", body: "Slow and blocked drains cleared without harsh chemicals.", icon: "valve" },
          ],
        },
        {
          type: "features",
          id: "water-heaters",
          tone: "alt",
          eyebrow: "Hot water",
          heading: "Water heaters",
          intro: "Repair when it makes sense, replacement when it does not — with the numbers to help you decide.",
          columns: 2,
          items: [
            {
              title: "Repair",
              body: "Thermostats, elements, igniters and relief valves, tested before we leave.",
              icon: "wrench",
              meta: "Typical visit: 1–2 hours",
            },
            {
              title: "Replacement",
              body: "Like-for-like or an upgrade, sized to your household, with permits handled.",
              icon: "flame",
              meta: "Typical visit: half a day",
            },
          ],
        },
        {
          type: "features",
          id: "heating",
          eyebrow: "Heating",
          heading: "Boilers & radiators",
          intro: "Yearly service keeps a boiler efficient and safe. We also chase down cold radiators room by room.",
          columns: 2,
          items: [
            {
              title: "Boiler service",
              body: "Cleaning, combustion check, pressure test and safety controls.",
              icon: "shield",
              meta: "Recommended every autumn",
            },
            { title: "Radiators", body: "Bleeding, balancing, valve replacement and leak repair.", icon: "radiator", meta: "Whole-house balancing available" },
          ],
        },
        {
          type: "cta-band",
          id: "book",
          tone: "inverse",
          heading: "Ready to book?",
          body: "Tell us what is going on and when you are home.",
          ctas: [{ label: "Request a visit", href: "/contact/", variant: "primary" }],
        },
      ],
    },
    {
      path: "/service-area/",
      title: "Service Area & Hours | Harborline Home Services",
      description: "The towns Harborline serves, office hours for calls and scheduling, and how to reach the office to book a plumbing or heating visit.",
      heading: "Service area & hours",
      sections: [{ type: "hours-location", id: "where", heading: "Where and when", intro: "We visit homes in the towns listed below." }],
    },
    {
      path: "/about/",
      title: "About | Harborline Home Services",
      description: "About Harborline, a small plumbing and heating crew serving homes around Alder Falls with written prices and tidy, careful work.",
      heading: "About Harborline",
      sections: [
        {
          type: "rich-text",
          id: "story",
          heading: "Small crew, careful work",
          paragraphs: [
            "Harborline is a small plumbing and heating team serving homes around Alder Falls. We answer the phone ourselves, give a written price before we start, and leave the place as tidy as we found it.",
            "Most of our work comes from neighbours of people we have helped before. We would rather fix one job properly than rush three.",
            "Harborline is a fictional business created to demonstrate this website template; its people, prices and details are invented.",
          ],
        },
        {
          type: "cta-band",
          id: "book",
          tone: "accent",
          heading: "Need a hand at home?",
          ctas: [{ label: "Request a visit", href: "/contact/", variant: "primary" }],
        },
      ],
    },
    {
      path: "/contact/",
      title: "Request a Visit | Harborline Home Services",
      description: "Request a plumbing or heating visit from Harborline. Tell us what is wrong and when you are home; we confirm an arrival window.",
      heading: "Request a visit",
      sections: [
        {
          type: "contact",
          id: "request",
          heading: "Tell us what's going on",
          intro: "We reply during office hours, usually within two hours.",
          form: "contact",
        },
      ],
    },
  ],
});
