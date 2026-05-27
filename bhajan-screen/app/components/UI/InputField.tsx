import { fieldStyles } from "@/app/constants/ui";
import { cn } from "@/app/lib/utils";
import { InputHTMLAttributes } from "react";


interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function InputField({
  label,
  error,
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

      <input
        className={cn(
          fieldStyles,
          "h-12",
          error && "border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />

      {error && (
        <p className="text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}