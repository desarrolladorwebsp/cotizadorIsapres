import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface IsapreLogoProps {
  isapre: string;
  size?: "md" | "lg";
  className?: string;
}

function initialsFromIsapre(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function isConsaludBrand(isapre: string): boolean {
  return isapre.toLowerCase().includes("consalud");
}

export function IsapreLogo({
  isapre,
  size = "lg",
  className,
}: IsapreLogoProps) {
  const isConsalud = isConsaludBrand(isapre);

  return (
    <div
      className={joinClasses(
        "flex shrink-0 items-center justify-center rounded-2xl shadow-sm",
        size === "lg" ? "size-14 sm:size-16" : "size-12",
        isConsalud
          ? "border-2 border-primary/30 bg-gradient-to-br from-primary/15 to-white text-primary-dark"
          : joinClasses(
              "border-2 border-primary/20 bg-primary/5 text-primary-dark",
              ui.borderHairline,
            ),
        className,
      )}
      role="img"
      aria-label={`Logo ${isapre}`}
    >
      <span
        className={joinClasses(
          "font-bold tracking-tight",
          size === "lg" ? "text-sm sm:text-base" : "text-xs",
        )}
      >
        {initialsFromIsapre(isapre)}
      </span>
    </div>
  );
}
