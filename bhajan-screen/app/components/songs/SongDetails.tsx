"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  FileText,
  Copy,
  Download,
  Layers,
  Activity,
  Music2,
  Quote,
  BookOpen,
  Languages,
  Sparkles,
  Printer,
  Loader2,
} from "lucide-react";

import { ConvertLyricsResponse, Song } from "@/app/types";
import Button from "../UI/Button";
import { Card } from "../UI/Card";
import { Badge, IconBadge, SidebarCard, SidebarItem } from "../UI/SongUI";
import { SelectField } from "../UI/SelectField";
import { LANGUAGES } from "@/app/constants/languages";
import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/app/API/public.api";
import { LyricsPanel } from "./LyricsPanel";

export default function SongDetail({ song }: { song: Song }) {
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES[0]?.value || "");
  const [convertedSong, setConvertedSong] = useState<Song | null>(null);

  const totalLines = useMemo(() => {
    return song.lyrics.reduce((acc, s) => acc + (s?.lines?.length || 0), 0);
  }, [song.lyrics]);

  const formatLyrics = useCallback(() => {
    return song.lyrics
      .map((sec) => {
        const sectionText = sec.lines
          .map((line, i) => {
            const chords =
              sec.chords?.[i]?.length
                ? `\n${sec.chords[i].join("  ")}`
                : "";
            return `${chords}\n${line}`;
          })
          .join("\n");

        return `[${sec.name}]\n${sectionText}`;
      })
      .join("\n\n");
  }, [song.lyrics]);

  const formattedLyrics = useMemo(() => formatLyrics(), [formatLyrics]);




  const { mutateAsync, isPending } = useMutation<
    ConvertLyricsResponse,
    Error,
    { id: string; language: string }
  >({
    mutationFn: ({ id, language }) =>
      publicApi.convertLyrics(id, language),

    onSuccess: (res) => {
      setConvertedSong(res.data.convertedSong);
    },
  });





  const convertLyrics = useCallback(async () => {
  await mutateAsync({
    id: song._id,
    language,
  });
}, [mutateAsync, song._id, language]);




  const copyLyrics = async () => {
    try {
      await navigator.clipboard.writeText(formattedLyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-28 space-y-8">

        {/* HEADER */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-100/40">

          <div className="flex flex-col xl:flex-row gap-6">

            {/* BACK + TITLE */}
            <div className="flex items-start gap-4 flex-1">

              <button className="p-3 rounded-2xl bg-white/70 border border-slate-200 hover:bg-indigo-50 transition shadow-sm">
                <ArrowLeft />
              </button>

              <div className="flex-1 space-y-4">

                <div className="flex items-center gap-3 flex-wrap">

                  <span className="bg-gradient-to-br from-pink-500 to-rose-500 text-white w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl text-xl font-black shadow-lg shadow-pink-200">
                    {song.number || "00"}
                  </span>

                  <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-slate-900 via-indigo-700 to-purple-700 text-transparent bg-clip-text">
                    {song.title}
                  </h1>
                </div>

                {/* BADGES */}
                <div className="flex flex-wrap gap-2">
                  <IconBadge icon={<Layers />} label={song.category} />
                  <IconBadge icon={<Activity />} label={song.tempo || "N/A"} />
                  <IconBadge icon={<Music2 />} label={song.scale} />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3 xl:items-center">

              <SelectField
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGES}
                className="w-full sm:w-[180px] bg-white/70 backdrop-blur border border-indigo-100 rounded-2xl px-3 py-2 text-xs font-bold uppercase text-slate-700 shadow-sm"
              />

              <Button
                onClick={convertLyrics}
                disabled={isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-200 hover:scale-[1.02] transition"
              >
                <Languages className="w-4 h-4" />
                {isPending ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Translate"
                )}
              </Button>

              <Button variant="secondary" className="w-full sm:w-auto rounded-2xl bg-white/70 backdrop-blur border border-slate-200 hover:border-indigo-200 hover:shadow-md">
                <Sparkles />
                Explain
              </Button>

            </div>
          </div>
        </Card>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">

          {/* LYRICS */}
          <div className="xl:col-span-8">
            <Card className="p-5 sm:p-7 lg:p-10 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-100/30">

              {/* HEADER */}
              <div className="flex items-center justify-between flex-wrap gap-3 mb-6">

                <h2 className="font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-2">
                  Lyrics <FileText size={16} />
                </h2>

                <div className="flex gap-2 flex-wrap">

                  <Button variant="secondary" className="rounded-2xl" onClick={copyLyrics}>
                    <Copy size={16} />
                    {copied ? "Copied" : "Copy"}
                  </Button>

                  <Button variant="secondary" className="rounded-2xl">
                    <Download size={16} />
                    Export
                  </Button>

                  <Button variant="secondary" className="rounded-2xl">
                    <Printer size={16} />
                    Print
                  </Button>

                </div>
              </div>

              {/* LYRICS */}
              <LyricsPanel title="Original Lyrics" song={song}/>

            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="xl:col-span-4 space-y-6">

            <SidebarCard title="Song Info">
              <SidebarItem icon={<Music2 />} label="Scale" value={song.scale} />
              <SidebarItem icon={<Activity />} label="Tempo" value={song.tempo || "N/A"} />
              <SidebarItem icon={<Layers />} label="Category" value={song.category} />
              <SidebarItem icon={<BookOpen />} label="Lines" value={String(totalLines)} />
            </SidebarCard>

            <SidebarCard title="Tags">
              {song.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {song.tags.map((t) => (
                    <Badge
                      key={t}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      <Quote size={12} />
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No tags</p>
              )}
            </SidebarCard>

          </div>

        </div>
      </div>
    </div>
  );
}