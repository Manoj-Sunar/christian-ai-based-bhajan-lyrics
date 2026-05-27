"use client";

import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import Link from "next/link";

const items = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Explore", path: "/explore" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed top-0 left-0 h-screen w-64 border-r border-gray-200 bg-surface pt-20 flex-col">
      
      <div className="px-6 mb-8">
        <h2 className="font-serif text-2xl font-semibold text-on-surface">
          Bhajan AI
        </h2>

        <p className="text-sm text-on-surface-variant">
          Spiritual Intelligence
        </p>
      </div>

      <div className="space-y-2 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
             href={item.path}
              key={item.label}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? "bg-surface-low text-secondary"
                    : "hover:bg-surface-container text-on-surface"
                }
              `}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}