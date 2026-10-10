/** WCAG 2.x relative luminance and contrast ratio for 6-digit hex colors. */
function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

import type { Theme } from "./schema";

/** Pairs that carry text or essential UI, with the minimum ratio each needs. */
export function contrastChecks(t: Theme) {
  const c = t.colors;
  return [
    { pair: "ink on bg", ratio: contrastRatio(c.ink, c.bg), min: 4.5 },
    { pair: "ink on surface", ratio: contrastRatio(c.ink, c.surface), min: 4.5 },
    { pair: "ink on surfaceAlt", ratio: contrastRatio(c.ink, c.surfaceAlt), min: 4.5 },
    { pair: "muted on bg", ratio: contrastRatio(c.muted, c.bg), min: 4.5 },
    { pair: "muted on surface", ratio: contrastRatio(c.muted, c.surface), min: 4.5 },
    { pair: "accentInk on accent", ratio: contrastRatio(c.accentInk, c.accent), min: 4.5 },
    { pair: "focus on bg", ratio: contrastRatio(c.focus, c.bg), min: 3 },
    { pair: "border on bg (UI)", ratio: contrastRatio(c.border, c.bg), min: 1.3 },
    { pair: "danger on surface", ratio: contrastRatio(c.danger, c.surface), min: 4.5 },
    { pair: "success on surface", ratio: contrastRatio(c.success, c.surface), min: 4.5 },
  ];
}
