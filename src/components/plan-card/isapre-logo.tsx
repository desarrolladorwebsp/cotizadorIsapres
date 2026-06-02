import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface IsapreLogoProps {
  isapre: string;
  className?: string;
}

function initialsFromIsapre(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function IsapreLogo({ isapre, className }: IsapreLogoProps) {
  return (
    <div
      className={joinClasses(
        "flex size-12 shrink-0 items-center justify-center rounded-xl bg-background text-brand",
        ui.borderHairline,
        className,
      )}
      aria-hidden
    >
      <span className="text-xs font-semibold tracking-tight">
        {initialsFromIsapre(isapre)}
      </span>
    </div>
  );
}
