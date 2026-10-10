import { defineSite } from "../../src/core/define-site";

/**
 * EXAMPLE 3 — Product / app landing page (fictional).
 * Tallyhook is an invented invoicing app. The "Open the app" CTA points at
 * `$app`; because the app URL is demo-only, every such CTA falls back to the
 * waitlist — the page never links to an app that does not exist.
 */
const DEMO_SOURCE = "Fictional demo content (Forge-CT template example)";

export default defineSite({
  id: "tallyhook",
  family: "product",
  demo: true,
  brand: { name: "Tallyhook", shortName: "Tallyhook", tagline: "Invoices that chase themselves.", monogram: "T" },
  business: {
    schemaType: "Organization",
    description: "Tallyhook is invoicing for freelancers and small studios: send an invoice in a minute and let polite reminders follow up for you.",
    email: { value: "hello@tallyhook.example.com", status: "demo", source: DEMO_SOURCE },
    appUrl: { value: "https://app.tallyhook.example.com", status: "demo", source: DEMO_SOURCE },
  },
  theme: {
    colorScheme: "light",
    colors: {
      bg: "#ffffff",
      surface: "#ffffff",
      surfaceAlt: "#f2f4fb",
      ink: "#0b1020",
      muted: "#4a5168",
      border: "#d9ddeb",
      accent: "#3a33e0",
      accentInk: "#ffffff",
      focus: "#d4207a",
      success: "#127a4a",
      danger: "#c0262d",
    },
    fonts: {
      heading: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      body: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      label: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    },
    headingCase: "normal",
    headingWeight: 800,
    headingTracking: "-0.035em",
    radius: { sm: "10px", md: "999px", lg: "20px", pill: "999px" },
    shadow: "soft",
    density: "airy",
    maxWidth: "68rem",
  },
  header: {
    variant: "minimal",
    cta: { label: "Open the app", href: "$app", variant: "primary", fallback: { label: "Join the waitlist", href: "/#waitlist" } },
  },
  nav: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing/" },
    { label: "Changelog", href: "/changelog/" },
  ],
  footer: {
    blurb: "A fictional product used to demonstrate the Forge-CT product landing template.",
    columns: [
      {
        heading: "Product",
        links: [
          { label: "Pricing", href: "/pricing/" },
          { label: "Changelog", href: "/changelog/" },
          { label: "Join the waitlist", href: "/#waitlist" },
        ],
      },
    ],
    legal: "Demo content only.",
  },
  forms: {
    waitlist: {
      provider: { provider: "demo" },
      topics: ["Freelancer", "Studio (2–10 people)", "Agency (10+)", "Just curious"],
      submitLabel: "Join the waitlist",
      privacyNote: "We will email you once, when your invite is ready. Demo: this form validates but sends nothing.",
    },
  },
  posts: {
    basePath: "/changelog/",
    items: [
      {
        slug: "reminder-schedules",
        title: "Custom reminder schedules",
        publishedAt: "2026-10-02",
        tag: "Feature",
        summary: "Choose when reminders go out — before the due date, on it, and after — per client.",
        body: ["Reminders can now be scheduled per client.", "Pick any combination of before, on and after the due date."],
      },
      {
        slug: "partial-payments",
        title: "Record partial payments",
        publishedAt: "2026-09-18",
        tag: "Feature",
        summary: "Mark an invoice as partly paid and reminders adjust to the remaining balance.",
        body: ["Record a partial payment from the invoice screen.", "Reminders automatically mention only the remaining balance."],
      },
    ],
  },
  pages: [
    {
      path: "/",
      title: "Tallyhook | Invoices That Chase Themselves",
      description: "Tallyhook is invoicing for freelancers and small studios. Send an invoice in a minute and let polite, scheduled reminders do the chasing.",
      sections: [
        {
          type: "hero",
          id: "top",
          variant: "centered",
          eyebrow: "Invoicing for freelancers",
          heading: "Send the invoice. Skip the awkward follow-up.",
          lede: "Tallyhook sends polite, scheduled reminders until an invoice is paid — so you never have to write “just circling back” again.",
          ctas: [
            { label: "Open the app", href: "$app", variant: "primary", fallback: { label: "Join the waitlist", href: "#waitlist" } },
            { label: "See pricing", href: "/pricing/", variant: "secondary" },
          ],
          art: "product-mock",
        },
        {
          type: "features",
          id: "features",
          tone: "alt",
          eyebrow: "Features",
          heading: "Everything between “sent” and “paid”",
          columns: 3,
          items: [
            { title: "One-minute invoices", body: "Line items, tax and due date. Save clients and rates for next time.", icon: "⚡" },
            { title: "Reminder schedules", body: "Before, on and after the due date — written in your voice, sent on time.", icon: "⏰" },
            { title: "Partial payments", body: "Record what came in; reminders mention only what's left.", icon: "◐" },
            { title: "Client portal", body: "Clients see every invoice in one link. No account needed.", icon: "🔗" },
            { title: "Exports", body: "CSV exports for your accountant at quarter end.", icon: "⇩" },
            { title: "Your data", body: "Export or delete your account at any time.", icon: "🔒" },
          ],
        },
        {
          type: "steps",
          id: "how",
          heading: "How it works",
          steps: [
            { title: "Create", body: "Add a client and line items." },
            { title: "Send", body: "Email the invoice with a pay link." },
            { title: "Relax", body: "Reminders follow your schedule until it's paid." },
          ],
        },
        {
          type: "cta-band",
          id: "pricing-teaser",
          tone: "inverse",
          heading: "Free for your first three clients.",
          body: "Upgrade when you outgrow it.",
          ctas: [{ label: "Compare plans", href: "/pricing/", variant: "primary" }],
        },
        {
          type: "faq",
          id: "faq",
          heading: "Questions",
          items: [
            {
              q: "Does Tallyhook process payments?",
              a: "No. In this demo it links to the payment method you already use. A real product page would state exactly which processors are supported.",
            },
            { q: "Can I change what reminders say?", a: "Yes, every reminder is editable per client." },
          ],
        },
        {
          type: "contact",
          id: "waitlist",
          tone: "alt",
          heading: "Join the waitlist",
          intro: "We're inviting people in batches.",
          form: "waitlist",
          showLocation: false,
        },
      ],
    },
    {
      path: "/pricing/",
      title: "Pricing | Tallyhook",
      description: "Tallyhook plans: free for your first three clients, a flat monthly price for solo freelancers, and custom pricing for studios.",
      heading: "Pricing",
      sections: [
        {
          type: "pricing",
          id: "plans",
          heading: "Simple plans",
          intro: "Prices are fictional demo content.",
          note: "All plans: cancel anytime, export your data anytime.",
          plans: [
            {
              name: "Starter",
              priceCents: 0,
              period: "month",
              summary: "For trying it out.",
              features: ["Up to 3 clients", "Reminder schedules", "Client portal"],
              cta: { label: "Join the waitlist", href: "/#waitlist", variant: "secondary" },
            },
            {
              name: "Solo",
              priceCents: 1200,
              period: "month",
              summary: "For full-time freelancers.",
              features: ["Unlimited clients", "Partial payments", "CSV exports"],
              cta: { label: "Open the app", href: "$app", variant: "primary", fallback: { label: "Join the waitlist", href: "/#waitlist" } },
              featured: true,
            },
            {
              name: "Studio",
              priceCents: null,
              summary: "For teams of 2–10.",
              features: ["Shared clients", "Roles", "Priority support"],
              cta: { label: "Talk to us", href: "/#waitlist", variant: "secondary" },
            },
          ],
        },
        {
          type: "faq",
          id: "pricing-faq",
          heading: "Billing questions",
          items: [{ q: "Is there a contract?", a: "No. Plans are month to month in this demo." }],
        },
      ],
    },
    {
      path: "/changelog/",
      title: "Changelog | Tallyhook",
      description: "What's new in Tallyhook: reminder schedules, partial payments and other improvements, newest first.",
      heading: "Changelog",
      sections: [{ type: "posts", id: "entries", heading: "Recent updates" }],
    },
  ],
});
