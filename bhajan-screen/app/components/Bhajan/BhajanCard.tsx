"use client"

import {  useSongContext } from "@/app/providers/SongContext";
import { Song } from "@/app/types";
import Link from "next/link";

type Props = {
  song: Song;
};

export default function BhajanCard({
  song
}: Props) {

  const{setSelectedSong}=useSongContext()

  

  return (



      <div className="bg-white rounded-lg p-6 shadow-xs transition">
        <span className="text-sm border px-3 py-1 rounded-full">
          {song.tags}
        </span>

        <h3 className="mt-5 text-2xl font-serif">
          {song.title}
        </h3>



        <Link
  href={`/explore/${song._id}`}
  onClick={() => setSelectedSong(song)}
>
  Read More →
</Link>
      </div>
   
  );
}