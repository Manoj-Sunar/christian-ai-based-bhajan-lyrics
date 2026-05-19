import { useMemo } from "react";

import { Song } from "@/app/types";

interface Props {
  songs: Song[];
  searchQuery?: string;
  category?: string;
  tempo?: string;
}

export function useSongFilter({
  songs,
  searchQuery = "",
  category = "",
  tempo = "",
}: Props) {
  return useMemo(() => {
    return songs.filter((song) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        song.title.toLowerCase().includes(query) ||
        song.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      const matchesCategory = category
        ? song.category === category
        : true;

      const matchesTempo = tempo
        ? song.tempo === tempo
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesTempo
      );
    });
  }, [songs, searchQuery, category, tempo]);
}