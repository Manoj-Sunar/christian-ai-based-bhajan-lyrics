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

import { ConvertLyricsResponse, ExplainLyricsResponse, Song } from "@/app/types";
import Button from "../UI/Button";
import { Card } from "../UI/Card";
import { Badge, IconBadge, SidebarCard, SidebarItem } from "../UI/SongUI";
import { SelectField } from "../UI/SelectField";
import { LANGUAGES } from "@/app/constants/languages";
import { useMutation } from "@tanstack/react-query";
import { publicApi } from "@/app/API/public.api";
import { LyricsPanel } from "./LyricsPanel";
import LyricsSkeleton from "../UI/LyricsSkeleton";

export default function SongDetail({ song }: { song: Song }) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedConverted, setCopiedConverted] = useState(false);

  const [language, setLanguage] = useState(LANGUAGES[0]?.value || "");
  const [convertedSong, setConvertedSong] = useState<Song | null>(null);
  const [showConverted, setShowConverted] = useState(false);




  const formatSongLyrics = useCallback((s: Song) => {
    return s.lyrics
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
  }, []);



  const formattedLyrics = useMemo(
    () => formatSongLyrics(song),
    [song, formatSongLyrics]
  );



  const totalLines = useMemo(
    () => song.lyrics.reduce((a, s) => a + (s?.lines?.length || 0), 0),
    [song.lyrics]
  );




  // ---------------- COPY ----------------
  const copyOriginalLyrics = useCallback(async () => {
    await navigator.clipboard.writeText(formattedLyrics);
    setCopiedOriginal(true);
    setTimeout(() => setCopiedOriginal(false), 1200);
  }, [formattedLyrics]);




  // ---------------- EXPORT ----------------
  const exportOriginalLyrics = useCallback(() => {
    const blob = new Blob([formattedLyrics], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${song.title}_lyrics.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }, [formattedLyrics, song.title]);




  // ---------------- PRINT ----------------
  const printOriginalLyrics = useCallback(() => {
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>${song.title}</title>
          <style>
            body {
              font-family: ui-sans-serif;
              padding: 40px;
              background: #fff;
              color: #111;
              white-space: pre-wrap;
            }
            h1 {
              font-size: 22px;
              margin-bottom: 20px;
              color: #4f46e5;
            }
            pre {
              font-size: 14px;
              line-height: 1.7;
            }
          </style>
        </head>
        <body>
          <h1>${song.title}</h1>
          <pre>${formattedLyrics}</pre>
        </body>
      </html>
    `);

    win.document.close();
    win.print();
  }, [formattedLyrics, song.title]);




// 
  const { mutateAsync, isPending } = useMutation<
    ConvertLyricsResponse,
    Error,
    { id: string; language: string }
  >({
    mutationFn: ({ id, language }) =>
      publicApi.convertLyrics(id, language),

    onSuccess: (res) => {
      const converted = (res as any)?.data?.convertedSong;
      if (!converted) return;

      setConvertedSong(converted);
      setShowConverted(true);
    },
  });



  // convert lyrics
  const convertLyrics = useCallback(async () => {
    setShowConverted(false);
    setConvertedSong(null);

    await mutateAsync({
      id: song._id,
      language,
    });
  }, [mutateAsync, song._id, language]);



  // formatted converted lyrics
  const formattedConvertedLyrics = useMemo(() => {
    if (!convertedSong) return "";
    return formatSongLyrics(convertedSong);
  }, [convertedSong, formatSongLyrics]);



  // copy converted lyrics
  const copyConverted = useCallback(async () => {
    if (!convertedSong) return;
    await navigator.clipboard.writeText(formattedConvertedLyrics);
    setCopiedConverted(true);
    setTimeout(() => setCopiedConverted(false), 1200);
  }, [convertedSong, formattedConvertedLyrics]);


  // download converted lyrics
  const downloadConverted = useCallback(() => {
    if (!convertedSong) return;

    const blob = new Blob([formattedConvertedLyrics], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${convertedSong.title}_translated.txt`;
    a.click();

    URL.revokeObjectURL(url);
  }, [convertedSong, formattedConvertedLyrics]);



  // explain lyrics
  const {mutateAsync:LyricsExplain,isPending:explainLyricsPending}=useMutation<ExplainLyricsResponse,Error,{id:string,language:string}>({
    mutationFn:({ id, language })=>publicApi.explainLyrics(id,language),
    onSuccess:(data)=>{
         console.log(data);
    }
  });


  const explainLyrics=useCallback(async(id:string)=>{
            await LyricsExplain({id,language})
  },[LyricsExplain,song._id,language])


  return (
    <div className="min-h-screen bg-[#f6f7fb]">

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 space-y-10">

        {/* ================= HEADER (Hero Style) ================= */}
        <Card className="p-8 rounded-3xl bg-white shadow-sm border border-slate-100">

          <div className="flex flex-col xl:flex-row justify-between gap-10">

            <div className="flex gap-5">

              <button className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 transition">
                <ArrowLeft size={18} />
              </button>

              <div className="space-y-4">

                <div className="flex items-center gap-4 flex-wrap">

                  <span className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                    {song.number || "00"}
                  </span>

                  <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                    {song.title}
                  </h1>

                </div>

                <div className="flex gap-2 flex-wrap">
                  <IconBadge icon={<Layers />} label={song.category} />
                  <IconBadge icon={<Activity />} label={song.tempo || "N/A"} />
                  <IconBadge icon={<Music2 />} label={song.scale} />
                </div>

              </div>
            </div>

            {/* TOOLBAR */}
            <div className="flex flex-wrap gap-3 items-center">

              <SelectField
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGES}
                className="w-44 border border-slate-200 rounded-xl px-3 py-2 text-sm"
              />

              <Button onClick={convertLyrics}>
                <Languages />
                {isPending ? <Loader2 className="animate-spin" /> : "Translate"}
              </Button>

              <Button variant="secondary" onClick={()=>explainLyrics(song._id)}>
                <Sparkles /> {explainLyricsPending?<Loader2/>:"Explain"}
              </Button>

            </div>
          </div>
        </Card>

        {/* ================= GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* LYRICS */}
          <div className="xl:col-span-6">
            <Card className="p-7 bg-white border border-slate-100 rounded-3xl">

              {/* HEADER TOOLBAR */}
              <div className="flex justify-between items-center mb-6">

                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  Lyrics <FileText size={16} />
                </h2>

                <div className="flex gap-2">

                  <Button variant="secondary" onClick={copyOriginalLyrics}>
                    <Copy size={14} />
                    {copiedOriginal ? "Copied" : "Copy"}
                  </Button>

                  <Button variant="secondary" onClick={exportOriginalLyrics}>
                    <Download size={14} /> Export
                  </Button>

                  <Button variant="secondary" onClick={printOriginalLyrics}>
                    <Printer size={14} /> Print
                  </Button>

                </div>
              </div>

              <LyricsPanel title="Original Lyrics" song={song} />

            </Card>
          </div>

          {/* RIGHT PANEL */}
          <div className="xl:col-span-6 space-y-6">

            {/* AI PANEL */}
            <Card className="p-7 border border-indigo-100 bg-indigo-50/40 rounded-3xl">

              <h2 className="font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                AI Assistant <Sparkles size={16} />
              </h2>

              {!showConverted && !isPending && (
                <div className="text-center py-16 text-slate-500">
                  Translate lyrics using AI to view result
                </div>
              )}

              {isPending && <LyricsSkeleton />}

              {showConverted && convertedSong && (
                <>
                  <div className="flex gap-2 mb-4">
                    <Button onClick={copyConverted}>Copy</Button>
                    <Button onClick={downloadConverted}>Download</Button>
                  </div>

                  <LyricsPanel song={convertedSong} title="AI Converted Lyrics" />
                </>
              )}

            </Card>

            {/* META */}
            <SidebarCard title="Song Info">
              <SidebarItem icon={<Music2 />} label="Scale" value={song.scale} />
              <SidebarItem icon={<Activity />} label="Tempo" value={song.tempo || "N/A"} />
              <SidebarItem icon={<Layers />} label="Category" value={song.category} />
              <SidebarItem icon={<BookOpen />} label="Lines" value={String(totalLines)} />
            </SidebarCard>

            {/* TAGS */}
            <SidebarCard title="Tags">
              <div className="flex flex-wrap gap-2">
                {song.tags?.map((t) => (
                  <Badge
                    key={t}
                    className="bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    <Quote size={12} />
                    {t}
                  </Badge>
                ))}
              </div>
            </SidebarCard>

          </div>
        </div>

      </div>
    </div>
  );
}