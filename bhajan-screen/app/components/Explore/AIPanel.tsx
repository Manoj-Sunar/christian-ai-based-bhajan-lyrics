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

  const [language, setLanguage] =
    useState("English");

  /**
   * SONG ID
   */
  const songId = selectedSong?._id;

  /**
   * QUERIES
   */
  const translateQuery = useTranslateLyrics(
    songId,
    language
  );

  const explainQuery = useExplainLyrics(
    songId,
    language
  );

  /**
   * ACTIVE STATES
   */
  const isLoading =
    tab === "translate"
      ? translateQuery.isFetching
      : explainQuery.isFetching;

  const error =
    tab === "translate"
      ? translateQuery.error
      : explainQuery.error;

  /**
   * ACTIVE DATA
   */
  const translated =
    translateQuery.data?.data?.convertedSong;

  const explained =
    explainQuery.data?.data?.explanation;

  /**
   * HANDLE AI ACTION
   */
  const handleGenerate = async () => {
    if (!songId) return;

    if (tab === "translate") {
      await translateQuery.refetch();
    }

    if (tab === "explain") {
      await explainQuery.refetch();
    }
  };

  return (
    <aside
      className="
        flex
        h-full
        flex-col
        border-l
        border-zinc-200
        bg-white
      "
    >
      {/* HEADER */}
      <div className="border-b border-zinc-200 p-5">

        {/* Title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-2xl bg-fuchsia-100 p-2">
            <Sparkles className="h-5 w-5 text-fuchsia-600" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-800">
              AI Assistant
            </h2>

            <p className="text-sm text-zinc-500">
              Translate & understand lyrics
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex rounded-2xl bg-zinc-100 p-1">

          {/* TRANSLATE */}
          <button
            onClick={() => setTab("translate")}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-xl
              py-3
              text-sm
              font-medium
              transition-all
              ${
                tab === "translate"
                  ? "bg-white text-fuchsia-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }
            `}
          >
            <Languages className="h-4 w-4" />
            Translate
          </button>

          {/* EXPLAIN */}
          <button
            onClick={() => setTab("explain")}
            className={`
              flex flex-1 items-center justify-center gap-2
              rounded-xl
              py-3
              text-sm
              font-medium
              transition-all
              ${
                tab === "explain"
                  ? "bg-white text-fuchsia-600 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900"
              }
            `}
          >
            <BookOpen className="h-4 w-4" />
            Explain
          </button>
        </div>
      </div>

      {/* LANGUAGE */}
      <div className="border-b border-zinc-100 p-4">
        <SelectField
          value={language}
          options={LANGUAGES}
          onChange={(e) =>
            setLanguage(e.target.value)
          }
          className="
            w-full
            rounded-2xl
            border
            border-zinc-200
            bg-white
            px-4
            py-3
            text-sm
            text-zinc-700
            outline-none
            transition
            focus:border-fuchsia-400
          "
        />
      </div>

      {/* ACTION BUTTON */}
      <div className="p-4">
        <button
          disabled={!selectedSong || isLoading}
          onClick={handleGenerate}
          className="
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-fuchsia-500
            to-purple-500
            px-4
            py-3
            text-sm
            font-semibold
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:scale-[1.02]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isLoading
            ? "Generating..."
            : tab === "translate"
            ? `Translate to ${language}`
            : "Explain Lyrics"}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* NO SONG */}
        {!selectedSong && (
          <div
            className="
              flex
              h-full
              flex-col
              items-center
              justify-center
              text-center
            "
          >
            <div className="mb-4 rounded-full bg-zinc-100 p-5">
              <Sparkles className="h-8 w-8 text-zinc-400" />
            </div>

            <h3 className="text-lg font-semibold text-zinc-700">
              No Song Selected
            </h3>

            <p className="mt-2 max-w-xs text-sm text-zinc-500">
              Select a worship song to translate
              or understand its meaning with AI.
            </p>
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div className="space-y-4 animate-pulse">

            <div className="rounded-2xl border border-zinc-200 p-4">
              <div className="mb-3 h-4 w-32 rounded bg-zinc-200" />

              <div className="space-y-2">
                <div className="h-3 rounded bg-zinc-200" />
                <div className="h-3 rounded bg-zinc-200" />
                <div className="h-3 w-5/6 rounded bg-zinc-200" />
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 p-4">
              <div className="mb-3 h-4 w-24 rounded bg-zinc-200" />

              <div className="space-y-2">
                <div className="h-3 rounded bg-zinc-200" />
                <div className="h-3 rounded bg-zinc-200" />
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div
            className="
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-sm
              text-red-500
            "
          >
            Failed to generate AI response.
          </div>
        )}

        {/* TRANSLATED CONTENT */}
        {!isLoading &&
          tab === "translate" &&
          translated?.lyrics?.map(
            (section: any) => (
              <div
                key={section.id}
                className="
                  mb-4
                  
                  
                  border-zinc-200
                  bg-white
                  p-2
                  
                "
              >
                <h3
                  className="
                    mb-4
                    text-sm
                    font-bold
                    uppercase
                    tracking-wide
                    text-fuchsia-600
                  "
                >
                  {section.name}
                </h3>

                <div className="">
                  <LyricsShow section={section}/>
                </div>
              </div>
            )
          )}

        {/* EXPLAIN CONTENT */}
        {!isLoading &&
          tab === "explain" &&
          explained?.map(
            (item: any, i: number) => (
              <div
                key={i}
                className="
                  mb-4
                  rounded-md
                  
                  border-zinc-200
                  bg-white
                  p-5
                  
                "
              >
                <h3
                  className="
                    mb-3
                    text-base
                    font-bold
                    text-fuchsia-600
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                    text-sm
                    leading-8
                    text-zinc-700
                  "
                >
                  {item.content}
                </p>
              </div>
            )
          )}
      </div>
    </aside>
  );
}