import { Suspense } from "react";

import { publicApi } from "@/app/API/public.api";
import { Song } from "@/app/types";


import SongToolbar from "./components/songs/SongsToolbar";
import PublicSongShow from "./components/songs/PublicSongsShow";
import PublicNav from "./components/common/Header";




interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tempo?: string;
  }>;
}

async function getSongs(): Promise<Song[]> {
  try {
    const res = await publicApi.getAllSongs();

    if (!res?.success) {
      return [];
    }

    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    return [];
  }
}

export default async function Home() {


  const songs = await getSongs();

  return (
    <div className="
  min-h-screen
  bg-gradient-to-br
  from-slate-50 via-indigo-50/40 to-purple-50/40
">
      <div className="md:w-[80%] mx-auto px-4 py-6 space-y-6">

        <PublicNav />

        <div className="
      bg-white/60 backdrop-blur-xl
      border border-white/40
      rounded-3xl
      p-4 shadow-lg
    ">
          <SongToolbar />
        </div>

        <Suspense fallback={
          <div className="text-center text-slate-400 py-10">
            Loading songs...
          </div>
        }>
          <PublicSongShow songs={songs} />
        </Suspense>

      </div>
    </div>
  );
}