"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { publicApi } from "@/app/API/public.api";
import { Song, ConvertLyricsResponse, ExplainLyricsResponse } from "@/app/types";

export function useSongActions(song: Song) {
  const [language, setLanguage] = useState("");
  const [convertedSong, setConvertedSong] = useState<Song | null>(null);
  const [explanation, setExplanation] = useState<ExplainLyricsResponse | null>(null);

  const convertMutation = useMutation({
    mutationFn: (lang: string) =>
      publicApi.convertLyrics(song._id, lang),
    onSuccess: (res: ConvertLyricsResponse) => {
      setConvertedSong(res.data.convertedSong);
    },
  });

  const explainMutation = useMutation({
    mutationFn: (lang: string) =>
      publicApi.explainLyrics(song._id, lang),
    onSuccess: (res: ExplainLyricsResponse) => {
      setExplanation(res);
    }
  });

  const convert = () => {
    setConvertedSong(null);
    convertMutation.mutate(language);
  };

  const explain = () => {
    setExplanation(null);
    explainMutation.mutate(language);
  };

  return {
    language,
    setLanguage,

    convertedSong,
    explanation,

    convert,
    explain,

    converting: convertMutation.isPending,
    explaining: explainMutation.isPending,
  };
}