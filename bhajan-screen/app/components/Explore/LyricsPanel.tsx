"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

import { useSongContext } from "@/app/providers/SongContext";
import { Song } from "@/app/types";
import VerseItem from "./VerseItem";

export default function LyricsPanel({
  songs,
}: {
  songs: Song[];
}) {
  const { setSelectedSong } = useSongContext();

  return (
    <div className="h-screen overflow-y-auto ">

      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10  backdrop-blur-xl">
        <div className="flex items-center justify-between p-5">
          <div>
            <h1 className="text-3xl font-bold">
              Worship Songs
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              Praise & Worship Collection
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-3">
            <Music2 className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Songs */}
      <div className="space-y-4 p-4">
        {songs.map((song, index) => (
          <Link
            key={song._id}
            href={`/explore/${song._id}`}
            onClick={() => setSelectedSong(song)}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="
                group
                relative
                overflow-hidden
                rounded-xs
                border
                border-white/10
                bg-white/[0.03]
                hover:bg-white/[0.05]
                backdrop-blur-xl
                transition-all
                duration-300
                shadow-xs
              "
            >
              {/* Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />
              </div>

              <VerseItem
                title={song.title}
                BhajanNumber={song.number}
                className="relative z-10 p-5"
              />

              <div className="h-[2px] w-0 bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-500 group-hover:w-full" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Empty */}
      {songs.length === 0 && (
        <div className="flex h-[70vh] flex-col items-center justify-center text-center">
          <div className="mb-5 rounded-full bg-white/10 p-6">
            <Music2 className="h-10 w-10 text-zinc-500" />
          </div>

          <h2 className="text-2xl font-semibold">
            No Songs Found
          </h2>

          <p className="mt-2 text-zinc-400">
            Add songs to your collection
          </p>
        </div>
      )}
    </div>
  );
}