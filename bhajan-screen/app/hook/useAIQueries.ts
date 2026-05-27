import { useQuery } from "@tanstack/react-query";

import { publicApi } from "../API/public.api";

import {
  ConvertLyricsResponse,
  ExplainLyricsResponse,
} from "../types";

/**
 * TRANSLATE LYRICS
 */
export function useTranslateLyrics(
  songId?: string,
  language: string = "English"
) {
  return useQuery<ConvertLyricsResponse>({
    queryKey: ["translate-lyrics", songId, language],

    queryFn: async () => {
      if (!songId) {
        throw new Error("Song ID is required");
      }

      return await publicApi.convertLyrics(
        songId,
        language
      );
    },

    enabled: Boolean(songId),

    staleTime: 1000 * 60 * 10,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}

/**
 * EXPLAIN LYRICS
 */
export function useExplainLyrics(
  songId?: string,
  language: string = "English"
) {
  return useQuery<ExplainLyricsResponse>({
    queryKey: ["explain-lyrics", songId, language],

    queryFn: async () => {
      if (!songId) {
        throw new Error("Song ID is required");
      }

      return await publicApi.explainLyrics(
        songId,
        language
      );
    },

    enabled: Boolean(songId),

    staleTime: 1000 * 60 * 10,

    retry: 1,

    refetchOnWindowFocus: false,
  });
}