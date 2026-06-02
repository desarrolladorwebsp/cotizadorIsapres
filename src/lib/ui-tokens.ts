/**
 * Semantic UI fragments — always prefer these over raw color utilities.
 * Maps 1:1 to CSS variables in globals.css.
 */
export const ui = {
  canvas: "bg-background text-foreground",
  mutedText: "text-muted",
  border: "border-border",
  borderHairline: "border border-border",
  hoverSurface: "hover:bg-surface-hover",
  input:
    "border border-border bg-background text-foreground placeholder:text-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/30",
  card: "rounded-xl border border-border bg-background",
  link: "text-brand transition hover:text-brand/80",
  cta: "bg-action text-action-foreground transition hover:bg-action-hover active:scale-[0.99]",
  ctaOutline:
    "border border-border bg-background text-foreground transition hover:bg-surface-hover",
} as const;

export type PercentageTone = "hospital" | "ambulatory" | "neutral";

export const percentageToneClass: Record<PercentageTone, string> = {
  hospital:
    "border-[hsl(var(--coverage-hospital)/0.35)] text-[hsl(var(--coverage-hospital))]",
  ambulatory:
    "border-[hsl(var(--coverage-ambulatory)/0.35)] text-[hsl(var(--coverage-ambulatory))]",
  neutral: "border-border text-muted",
};

export type StatusBadgeTone = "brand" | "highlight" | "neutral";

export const statusBadgeToneClass: Record<StatusBadgeTone, string> = {
  brand:
    "border-[hsl(var(--brand)/0.3)] bg-brand-muted text-[hsl(var(--brand))]",
  highlight:
    "border-[hsl(var(--highlight)/0.35)] bg-highlight-muted text-[hsl(var(--highlight-foreground))]",
  neutral: "border-border bg-background text-muted",
};

export function resolveBadgeTone(label: string): StatusBadgeTone {
  const key = label.toLowerCase();
  if (key === "preferente") return "highlight";
  if (key === "top") return "brand";
  return "neutral";
}
