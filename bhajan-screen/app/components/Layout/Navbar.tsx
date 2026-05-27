import { Globe, Moon } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">
          Bhajan AI
        </h1>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Globe size={20} />
          </button>

          <button className="p-2 rounded-full hover:bg-gray-100">
            <Moon size={20} />
          </button>

          <div className="w-9 h-9 rounded-full bg-gray-200" />
        </div>
      </div>
    </nav>
  );
}