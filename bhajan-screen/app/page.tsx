import { Suspense } from "react";
import { publicApi } from "./API/public.api";
import PublicLayout from "./components/Layout/PublicLayout";
import SongToolbar from "./components/songs/SongsToolbar";
import SongsList from "./components/songs/SongsList";


async function getSongs() {
  try {
    const res = await publicApi.getAllSongs();
    return res?.success ? res.data ?? [] : [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const songs = await getSongs();

  return (
    <PublicLayout>
      {/* Header Section */}
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Hymn Library
        </h1>
        <p className="text-slate-500">
          Explore sacred Nepali Christian songs with insights
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-8">
        <SongToolbar />
      </div>

      {/* Song List */}
      <Suspense fallback={<p className="text-slate-400">Loading songs...</p>}>
        <SongsList songs={songs} />
      </Suspense>
    </PublicLayout>
  );
}