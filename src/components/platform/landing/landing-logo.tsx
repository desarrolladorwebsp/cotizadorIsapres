import Image from "next/image";
import { COTIZADOR_PREMIUM_LOGO_PATH } from "@/lib/partner-entity/cotizador-premium-palette";

interface LandingLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: { box: "h-10 w-10", image: 40, sizes: "40px" },
  md: { box: "h-12 w-12", image: 48, sizes: "48px" },
  lg: { box: "h-14 w-14", image: 56, sizes: "56px" },
} as const;

export function LandingLogo({ size = "md", className = "" }: LandingLogoProps) {
  const config = SIZE[size];

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-xl bg-background shadow-sm ${config.box} ${className}`}
    >
      <Image
        src={COTIZADOR_PREMIUM_LOGO_PATH}
        alt="Cotizador Premium"
        width={config.image}
        height={config.image}
        className="h-full w-full object-contain p-0.5"
        sizes={config.sizes}
        priority
      />
    </span>
  );
}
