import { Song } from "@/app/types";
import { Music2 } from "lucide-react";

export default function SongRow({ song }: { song: Song }) {
  return (
    <div className="group flex items-center justify-between px-5 py-5 hover:bg-slate-50 transition">
      
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-slate-400">
          {song.number}
        </span>

        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
          <Music2 size={18} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">
            {song.title}
          </h3>
          <p className="text-xs text-slate-500">{song.category}</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden sm:flex items-center gap-10 text-sm">
        <div>
          <p className="text-xs text-slate-400">Key</p>
          <p className="font-mono text-indigo-600">{song.scale}</p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Tempo</p>
          <p className="text-purple-600 font-semibold">
            {song.tempo || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}