"use client";

import { useState } from "react";
import { Sparkles, Languages, BookOpen } from "lucide-react";

import {
  useExplainLyrics,
  useTranslateLyrics,
} from "@/app/hook/useAIQueries";

import { useSongContext } from "@/app/providers/SongContext";
import { SelectField } from "../UI/SelectField";
import { LANGUAGES } from "@/app/constants/languages";
import LyricsShow from "../Bhajan/LyricsShow";

type Tab = "translate" | "explain";

export default function AIPanel() {
  const { selectedSong } = useSongContext();

  const [tab, setTab] = useState<Tab>("translate");
  const [language, setLanguage] = useState("English");

  const songId = selectedSong?._id;

  const translateQuery = useTranslateLyrics(songId, language);
  const explainQuery = useExplainLyrics(songId, language);

  const translated = translateQuery.data?.data?.convertedSong;
  const explained = explainQuery.data?.data?.explanation;

  const isLoading = translateQuery.isFetching || explainQuery.isFetching;
  const error = translateQuery.error || explainQuery.error;

  const handleGenerate = async () => {
    if (!songId) return;

    if (tab === "translate") {
      await translateQuery.refetch();
    } else {
      await explainQuery.refetch();
    }
  };

  return (
    <aside className="flex flex-col h-full w-full bg-white">

      {/* HEADER (fixed height) */}
      <div className="shrink-0 border-b border-zinc-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-2xl bg-fuchsia-100 p-2">
            <Sparkles className="h-5 w-5 text-fuchsia-600" />
          </div>

          <div>
            <h2 className="text-base font-bold">AI Assistant</h2>
            <p className="text-xs text-zinc-500">
              Translate & explain lyrics
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex rounded-2xl bg-zinc-100 p-1">
          <button
            onClick={() => setTab("translate")}
            className={`flex-1 py-2 rounded-xl text-sm ${
              tab === "translate"
                ? "bg-white text-fuchsia-600"
                : "text-zinc-500"
            }`}
          >
            <Languages className="inline h-4 w-4 mr-1" />
            Translate
          </button>

          <button
            onClick={() => setTab("explain")}
            className={`flex-1 py-2 rounded-xl text-sm ${
              tab === "explain"
                ? "bg-white text-fuchsia-600"
                : "text-zinc-500"
            }`}
          >
            <BookOpen className="inline h-4 w-4 mr-1" />
            Explain
          </button>
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="shrink-0 border-b border-zinc-100 p-4">
        <SelectField
          value={language}
          options={LANGUAGES}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full"
        />
      </div>

      {/* CONTENT (THIS IS THE FIX) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">

        {!selectedSong && (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
            Select a song to start AI assistant
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm">
            Failed to load AI response
          </div>
        )}

        {tab === "translate" &&
          translated?.lyrics?.map((section: any) => (
            <div key={section.id} className="space-y-2">
              <h3 className="font-bold text-fuchsia-600">
                {section.name}
              </h3>
              <LyricsShow section={section} />
            </div>
          ))}

        {tab === "explain" &&
          explained?.map((item: any, i: number) => (
            <div key={i} className="space-y-2">
              <h3 className="font-bold text-fuchsia-600">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-700 leading-7">
                {item.content}
              </p>
            </div>
          ))}

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-1/2" />
            <div className="h-3 bg-zinc-200 rounded" />
            <div className="h-3 bg-zinc-200 rounded w-5/6" />
          </div>
        )}

      </div>

      {/* FOOTER BUTTON (FIXED, ALWAYS VISIBLE) */}
      <div className="shrink-0 border-t border-zinc-200 p-4 bg-white">
        <button
          disabled={!songId || isLoading}
          onClick={handleGenerate}
          className="
            w-full
            rounded-2xl
            bg-gradient-to-r from-fuchsia-500 to-purple-500
            py-3
            text-white
            font-semibold
            disabled:opacity-50
          "
        >
          {isLoading
            ? "Generating..."
            : tab === "translate"
            ? `Translate (${language})`
            : "Explain Lyrics"}
        </button>
      </div>

    </aside>
  );
}