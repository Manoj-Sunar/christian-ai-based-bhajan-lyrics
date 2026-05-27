"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import {
  useExplainLyrics,
  useTranslateLyrics,
} from "@/app/hook/useAIQueries";

import { useSongContext } from "@/app/providers/SongContext";
import { SelectField } from "../UI/SelectField";
import { LANGUAGES } from "@/app/constants/languages";

type Tab = "translate" | "explain" | "insights";

export default function AIPanel() {
  const { selectedSong } = useSongContext();

  const [tab, setTab] = useState<Tab>("translate");
  const [language, setLanguage] = useState("English");

  const songId = selectedSong?._id;


  const translateQuery = useTranslateLyrics(
    tab === "translate"
      ? selectedSong?._id
      : undefined,
    language
  );

  const explainQuery = useExplainLyrics(
    tab === "explain"
      ? selectedSong?._id
      : undefined,
    language
  );

  /**
   * STATES
   */
  const isLoading =
    translateQuery.isLoading ||
    explainQuery.isLoading;

  const error =
    translateQuery.error ||
    explainQuery.error;

  const translated =
    translateQuery.data?.data.convertedSong;

  const explained =
    explainQuery.data?.data.explanation;



  return (
    <aside className="flex h-full flex-col border-l border-white/10  text-gray-700">

      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-fuchsia-400" />

          <h2 className="text-lg font-semibold">
            AI Assistant
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex rounded-2xl bg-white/5 p-1">
          {(["translate", "explain", "insights"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`
                flex-1 rounded-xl py-2 text-sm font-medium transition
                ${tab === t
                  ? "bg-fuchsia-500 text-white"
                  : "text-zinc-400 hover:text-white"
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Language */}
      {tab !== "insights" && (
        <div className="p-4">
          <SelectField value={language}
          options={LANGUAGES}
            onChange={(e) => setLanguage(e.target.value)}
            className="
              w-full rounded-xl
              border border-white/10
              bg-white/5
              px-4 py-3
              text-sm
              outline-none
            "/>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">

        {!selectedSong && (
          <div className="flex h-full items-center justify-center text-center text-zinc-500">
            Select a worship song
          </div>
        )}

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            Failed to generate AI response.
          </div>
        )}

        {/* TRANSLATE */}
        {tab === "translate" &&
          translated?.lyrics?.map(
            (section: any) => (
              <div
                key={section.id}
                className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <h3 className="mb-3 font-semibold text-fuchsia-400">
                  {section.name}
                </h3>

                <div className="space-y-2">
                  {section.lines.map(
                    (line: string, i: number) => (
                      <p
                        key={i}
                        className="text-sm leading-7 text-zinc-600"
                      >
                        {line}
                      </p>
                    )
                  )}
                </div>
              </div>
            )
          )}

        {/* EXPLAIN */}
        {tab === "explain" &&
          explained?.map((item: any, i: number) => (
            <div
              key={i}
              className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <h3 className="mb-2 font-semibold text-fuchsia-400">
                {item.title}
              </h3>

              <p className="text-sm leading-7 text-zinc-600">
                {item.content}
              </p>
            </div>
          ))}

        {/* INSIGHTS */}
        {tab === "insights" && (
          <div className="space-y-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-300">
                Theme: Worship & Devotion
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-zinc-300">
                Mood: Spiritual Reflection
              </p>
            </div>

          </div>
        )}
      </div>
    </aside>
  );
}