import React from 'react';
import { Music4, LogIn, Sparkles, Compass } from 'lucide-react';
import { View } from '@/app/types';
import { cn } from '@/app/lib/utils';
import Link from 'next/link';


interface PublicNavProps {
  onViewChange: (view: View) => void;
  onAdminLogin: () => void;
  currentView?: string;
}

export default function PublicNav() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl h-20 bg-white/70 backdrop-blur-2xl border border-white/40 z-[100] px-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-slate-900/5 flex items-center justify-between transition-all duration-500">
      <button

        className="flex items-center gap-4 group"
      >
        <div className="relative">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <Music4 className="text-white" size={24} />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
            <Sparkles className="text-white" size={8} />
          </div>
        </div>
        <div className="text-left hidden sm:block">
          <h1 className="font-black text-2xl text-slate-900 tracking-tighter uppercase leading-none">WorshipFlow</h1>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 block px-2 py-0.5 bg-indigo-50 rounded-full w-fit">Public Access</span>
        </div>
      </button>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Navigation Links */}
        <div className="hidden lg:flex items-center bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100/50 mr-4">

        </div>

        {/* Login Button - "Amazing" Style */}
        <button

          className="group relative flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-black text-sm hover:translate-y-[-2px] transition-all duration-300 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] ring-1 ring-white/10 overflow-hidden"
        >
          {/* Animated Gradient Background on Hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]" />

          <div className="relative z-10 flex items-center gap-3">

            <Link href={"/auth/login"} className="uppercase tracking-widest text-[11px]">
              <LogIn size={18} className="group-hover:rotate-12 transition-transform" />
              Login
            </Link>
          </div>

          {/* Subtle reflection effect */}
          <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000 ease-in-out" />
        </button>
      </div>
    </nav>
  );
}
