import Link from "next/link";
import { Song } from "@/app/types";
import SongRow from "./SongsRow";


export default function PublicSongShow({ songs }: { songs: Song[] }) {
  return (
    <div className="space-y-4">
      {songs.map((song) => (
        <Link
          key={song._id}
          href={`/${song._id}`}
          className="block focus:outline-none"
        >
          <SongRow song={song} />
        </Link>
      ))}
    </div>
  );
}