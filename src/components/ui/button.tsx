import type { ButtonHTMLAttributes } from "react";
import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "brand";
type ButtonSize = "md" | "sm" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: joinClasses(ui.cta, "shadow-[0_4px_14px_-4px_hsl(var(--action)/0.4)]"),
  brand:
    "bg-brand text-brand-foreground hover:brightness-110 active:brightness-95",
  secondary: joinClasses(ui.ctaOutline),
  ghost:
    "bg-transparent text-foreground hover:bg-surface-hover active:bg-surface-hover/80",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-base rounded-lg",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClasses(
        "inline-flex items-center justify-center font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
