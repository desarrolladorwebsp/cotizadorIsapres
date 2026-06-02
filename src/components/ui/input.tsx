import type { InputHTMLAttributes } from "react";
import { joinClasses } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={joinClasses(
        "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
