"use client";

import { cn } from "@/app/lib/utils";
import { motion } from "framer-motion";


interface SwitchFieldProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}

export default function SwitchField({
  value,
  onChange,
  label,
}: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
      <span className="font-semibold text-slate-700">
        {label}
      </span>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          "w-14 h-7 rounded-full relative transition",
          value ? "bg-indigo-600" : "bg-slate-300"
        )}
      >
        <motion.div
          animate={{
            x: value ? 28 : 4,
          }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full"
        />
      </button>
    </div>
  );
}