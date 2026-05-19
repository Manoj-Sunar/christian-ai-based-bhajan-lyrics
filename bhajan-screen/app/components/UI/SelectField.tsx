import { fieldStyles } from "@/app/constants/ui";
import { cn } from "@/app/lib/utils";
import { SelectHTMLAttributes } from "react";


interface Props
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;

  options: {
    label: string;
    value: string;
  }[];
}

export function SelectField({
  label,
  options,
  className,
  ...props
}: Props) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}

      <select
        className={cn(fieldStyles, className)}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
             className="bg-slate-900 text-white" 
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}