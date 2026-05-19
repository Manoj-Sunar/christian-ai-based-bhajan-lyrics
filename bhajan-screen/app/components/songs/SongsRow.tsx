"use client";

import { Song } from "@/app/types";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

export default function SongRow({ song }: { song: Song }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="
        group cursor-pointer
        flex flex-col sm:flex-row sm:items-center justify-between
        gap-4 sm:gap-6
        rounded-3xl
        border border-white/40
        bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/30
        backdrop-blur-xl
        p-4 sm:p-5
        shadow-sm hover:shadow-xl hover:shadow-indigo-100/40
        transition-all
      "
    >
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4 sm:gap-5">

        {/* NUMBER */}
        <span className="
          text-[10px] font-black tracking-widest
          text-indigo-500
        ">
          #{song.number}
        </span>

        {/* ICON */}
        <div className="
          flex h-12 w-12 sm:h-14 sm:w-14
          items-center justify-center
          rounded-2xl
          bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
          text-white
          shadow-lg shadow-purple-200
        ">
          <Music2 className="w-5 h-5" />
        </div>

        {/* TITLE */}
        <div className="space-y-1">
          <h4 className="
            text-sm sm:text-base lg:text-lg
            font-black tracking-tight
            text-slate-900
            group-hover:text-indigo-600
            transition
          ">
            {song.title}
          </h4>

          <p className="
            text-[10px] sm:text-xs font-semibold
            text-slate-500 uppercase tracking-wider
          ">
            {song.category}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6 sm:gap-10">

        {/* SCALE */}
        <div className="text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Key
          </p>
          <p className="font-mono text-sm font-bold text-indigo-700">
            {song.scale}
          </p>
        </div>

        {/* TEMPO */}
        <div className="text-center sm:text-left">
          <p className="text-[10px] font-bold uppercase text-slate-400">
            Tempo
          </p>
          <p className="text-sm font-bold text-purple-700">
            {song.tempo || "—"}
          </p>
        </div>

        {/* ARROW INDICATOR */}
        <div className="
          hidden sm:flex
          text-slate-300 group-hover:text-indigo-500
          transition
        ">
          →
        </div>

      </div>
    </motion.div>
  );
}