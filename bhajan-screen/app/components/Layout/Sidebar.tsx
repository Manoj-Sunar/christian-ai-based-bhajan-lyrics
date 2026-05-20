import Link from "next/link";
import { Home, Library, Heart, Settings } from "lucide-react";

const items = [
  { label: "Home", href: "/", icon: Home },
  { label: "Library", href: "/", icon: Library },
  { label: "Favorites", href: "/", icon: Heart },
  { label: "Settings", href: "/", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex-col">
      
      <div className="p-6">
        <h2 className="text-lg font-bold text-slate-900">Sacred Lyrics</h2>
        <p className="text-xs text-slate-500">Nepali Christian Bhajan</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}