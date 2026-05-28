import { useQuery } from "@tanstack/react-query";

import { publicApi } from "../API/public.api";

import {
  ConvertLyricsResponse,
  ExplainLyricsResponse,
} from "../types";





export function useTranslateLyrics(
  songId?: string,
  language: string = "English"
) {
  return useQuery({
    queryKey: ["translate", songId, language],

    queryFn: async () => {
      if (!songId) {
        throw new Error("Song ID required");
      }

      return publicApi.convertLyrics(
        songId,
        language
      );
    },

    enabled: false,
  });
}

export function useExplainLyrics(
  songId?: string,
  language: string = "English"
) {
  return useQuery({
    queryKey: ["explain", songId, language],

    queryFn: async () => {
      if (!songId) {
        throw new Error("Song ID required");
      }

      return publicApi.explainLyrics(
        songId,
        language
      );
    },

    enabled: false,
  });
}