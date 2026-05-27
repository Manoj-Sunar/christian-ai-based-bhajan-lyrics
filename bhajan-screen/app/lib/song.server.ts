import { publicApi } from "@/app/API/public.api";
import { Song } from "@/app/types";

let cachedSongs: Song[] | null = null;
let lastFetch = 0;

const CACHE_TIME = 1000 * 60 * 60; // 1 hour

export async function getAllSongsServer(): Promise<Song[]> {
  const now = Date.now();

  if (cachedSongs && now - lastFetch < CACHE_TIME) {
    return cachedSongs;
  }

  const res = await publicApi.getAllSongs();
  cachedSongs = res?.data || [];
  lastFetch = now;

  return cachedSongs;
}