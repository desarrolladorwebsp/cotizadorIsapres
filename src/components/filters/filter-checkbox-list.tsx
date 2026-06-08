import { touchRow, ui } from "@/lib/ui-tokens";
import { joinClasses } from "@/lib/utils";
import type { FilterOption } from "@/domain";

export interface FilterCheckboxListProps {
  options: FilterOption[];
  state: Record<string, boolean>;
  idPrefix: string;
  onToggle: (optionId: string, checked: boolean) => void;
  scrollable?: boolean;
  className?: string;
}

export function FilterCheckboxList({
  options,
  state,
  idPrefix,
  onToggle,
  scrollable = false,
  className,
}: FilterCheckboxListProps) {
  return (
    <div
      className={joinClasses(
        "space-y-1",
        scrollable && "max-h-52 overflow-y-auto overscroll-contain pr-1",
        className,
      )}
    >
      {options.map((option) => {
        const inputId = `${idPrefix}-${option.id}`;

        return (
          <label
            key={option.id}
            htmlFor={inputId}
            className={joinClasses(
              "flex w-full cursor-pointer items-center gap-3 rounded-lg text-sm text-foreground transition",
              touchRow,
              ui.hoverSurface,
            )}
          >
            <input
              id={inputId}
              type="checkbox"
              checked={Boolean(state[option.id])}
              onChange={(event) => onToggle(option.id, event.target.checked)}
              className="size-5 shrink-0 rounded border-border accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:size-4"
            />
            <span className="min-h-12 flex flex-1 items-center leading-snug md:min-h-0">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
