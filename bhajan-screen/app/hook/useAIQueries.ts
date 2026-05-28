import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../API/public.api";

/**
 * TRANSLATE (MANUAL ONLY)
 */
export function useTranslateLyrics(
  songId?: string,
  language?: string
) {
  return useQuery({
    queryKey: ["translate", songId, language],

    queryFn: async () => {
      if (!songId) throw new Error("No songId");

      return publicApi.convertLyrics(songId, language || "English");
    },

    enabled: false, // 🔥 IMPORTANT: disable auto fetch
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * EXPLAIN (MANUAL ONLY)
 */
export function useExplainLyrics(
  songId?: string,
  language?: string
) {
  return useQuery({
    queryKey: ["explain", songId, language],

    queryFn: async () => {
      if (!songId) throw new Error("No songId");

      return publicApi.explainLyrics(songId, language || "English");
    },

    enabled: false, // 🔥 IMPORTANT
    staleTime: 1000 * 60 * 10,
  });
}