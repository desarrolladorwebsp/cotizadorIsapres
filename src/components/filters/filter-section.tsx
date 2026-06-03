import { ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";

export interface FilterSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({
  title,
  description,
  children,
  className,
}: FilterSectionProps) {
  return (
    <section className={joinClasses(ui.surfaceCard, "p-5 sm:p-6", className)}>
      <header className="mb-5 space-y-1">
        <h2
          className={joinClasses(
            "text-sm font-bold tracking-tight",
            ui.sectionTitle,
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
