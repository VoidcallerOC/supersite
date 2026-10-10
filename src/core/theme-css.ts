import type { Theme } from "./schema";

const SECTION_Y = { compact: "clamp(2.5rem, 5vw, 3.5rem)", comfortable: "clamp(3.5rem, 7vw, 5.5rem)", airy: "clamp(4.5rem, 10vw, 8rem)" } as const;

/**
 * Turn a site's theme into CSS custom properties. Components only ever read
 * these variables, so re-theming a client never means editing a component.
 */
export function themeCss(t: Theme): string {
  const c = t.colors;
  const shadow = t.shadow === "none" ? "none" : t.shadow === "soft" ? "0 1px 2px rgb(0 0 0 / 0.06), 0 8px 24px -12px rgb(0 0 0 / 0.18)" : `4px 4px 0 ${c.ink}`;
  const vars: Record<string, string> = {
    "--c-bg": c.bg,
    "--c-surface": c.surface,
    "--c-surface-alt": c.surfaceAlt,
    "--c-ink": c.ink,
    "--c-muted": c.muted,
    "--c-border": c.border,
    "--c-accent": c.accent,
    "--c-accent-ink": c.accentInk,
    "--c-focus": c.focus,
    "--c-success": c.success,
    "--c-danger": c.danger,
    "--f-heading": t.fonts.heading,
    "--f-body": t.fonts.body,
    "--f-label": t.fonts.label ?? t.fonts.body,
    "--heading-case": t.headingCase,
    "--heading-weight": String(t.headingWeight),
    "--heading-tracking": t.headingTracking,
    "--r-sm": t.radius.sm,
    "--r-md": t.radius.md,
    "--r-lg": t.radius.lg,
    "--r-pill": t.radius.pill,
    "--shadow-card": shadow,
    "--section-y": SECTION_Y[t.density],
    "--max-w": t.maxWidth,
  };
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
  return `:root {\n  color-scheme: ${t.colorScheme};\n${body}\n}\n`;
}
