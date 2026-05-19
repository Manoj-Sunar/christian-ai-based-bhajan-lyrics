"use client";

import React from "react";
import { cn } from "@/app/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
};

export default function Button({
  className,
  variant = "primary",
  icon,
  children,
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all active:scale-95",
        variant === "primary" &&
          "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5",
        variant === "secondary" &&
          "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50",
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}