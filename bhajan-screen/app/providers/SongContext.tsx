"use client";

import { createContext, useContext, useState } from "react";
import { Song } from "@/app/types";

type SongContextType = {
  selectedSong?: Song;
  setSelectedSong: (song?: Song) => void;
};

const SongContext = createContext<SongContextType | null>(null);

export function SongProvider({ children }: { children: React.ReactNode }) {
  const [selectedSong, setSelectedSong] = useState<Song | undefined>();

  return (
    <SongContext.Provider value={{ selectedSong, setSelectedSong }}>
      {children}
    </SongContext.Provider>
  );
}

export function useSongContext() {
  const ctx = useContext(SongContext);
  if (!ctx) throw new Error("SongProvider missing");
  return ctx;
}