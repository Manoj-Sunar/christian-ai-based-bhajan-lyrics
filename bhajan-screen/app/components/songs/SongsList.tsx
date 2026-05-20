import Link from "next/link";

import { Song } from "@/app/types";
import SongRow from "./SongsRow";

export default function SongsList({ songs }: { songs: Song[] }) {
  return (
    <div className="divide-y divide-slate-200 bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {songs.map((song) => (
        <Link key={song._id} href={`/${song._id}`}>
          <SongRow song={song} />
        </Link>
      ))}
    </div>
  );
}