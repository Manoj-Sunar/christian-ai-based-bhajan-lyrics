"use client";

import { cn } from "@/app/lib/utils";
import React from "react";


interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextAreaField({
  label,
  error,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-black uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}

      <textarea
        {...props}
        className={cn(
          "w-full bg-slate-50 border border-transparent rounded-2xl px-4 py-3 outline-none resize-none transition-all focus:ring-2 focus:ring-indigo-500",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
      />

      {error && (
        <p className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}