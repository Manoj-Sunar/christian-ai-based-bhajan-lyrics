import { fieldStyles } from "@/app/constants/ui";
import { cn } from "@/app/lib/utils";
import { SelectHTMLAttributes } from "react";
import { LANGUAGES } from "@/app/constants/languages";

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: { label: string; value: string }[];
}

export function SelectField({
  label,
  options = LANGUAGES,
  className,
  ...props
}: Props) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          className={cn(fieldStyles, "appearance-none pr-10", className)}
          {...props}
        >
          <option value="">Select language</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* custom arrow like Stitch */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          ▾
        </div>
      </div>
    </div>
  );
}