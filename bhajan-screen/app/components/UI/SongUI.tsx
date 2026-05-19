"use client"

import React from "react";
import { cn } from "@/app/lib/utils";

/* ---------------- BUTTON SYSTEM ---------------- */

export function PrimaryButton({
  children,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-white font-bold hover:bg-indigo-700 transition"
    >
      {icon}
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

/* ---------------- BADGE ---------------- */

export function IconBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold">
      {icon}
      {label}
    </span>
  );
}

/* ---------------- SIDEBAR ---------------- */

export function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow">
      <h3 className="font-bold mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function SidebarItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {icon}
        {label}
      </div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  );
}





export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600",
        className
      )}
    >
      {children}
    </span>
  );
}