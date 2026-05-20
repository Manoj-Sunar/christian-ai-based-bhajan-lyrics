"use client";

import React, { useMemo, useCallback, useState } from "react";
import { Song } from "@/app/types";
import { formatSongLyrics } from "./utils/formatSong";
import { useSongActions } from "./hook/useSongActions";
import ActionButton from "../UI/ActionButton";
import { SelectField } from "../UI/SelectField";
import { LANGUAGES } from "@/app/constants/languages";

import {
    Languages,
    Sparkles,
    BookOpenText,
    Copy,
    Download,
} from "lucide-react";

type ViewMode = "original" | "translated" | "explanation";

export default function SongDetail({ song }: { song: Song }) {
    const {
        language,
        setLanguage,
        convertedSong,
        explanation,
        convert,
        explain,
        converting,
        explaining,
    } = useSongActions(song);

    const originalLyrics = useMemo(() => formatSongLyrics(song), [song]);

    const convertedLyrics = useMemo(
        () => (convertedSong ? formatSongLyrics(convertedSong) : ""),
        [convertedSong]
    );

    const [view, setView] = useState<ViewMode>("original");
    const [hasGenerated, setHasGenerated] = useState(false);

    const isLoading = converting || explaining;

    /* =========================
       COPY FUNCTION
    ========================= */
    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
    }, []);

    /* =========================
       DOWNLOAD FUNCTION
    ========================= */
    const downloadTxt = useCallback((title: string, text: string) => {
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.txt`;
        a.click();

        URL.revokeObjectURL(url);
    }, []);

    /* =========================
       CONTENT SELECTOR
    ========================= */
    const getCurrentContent = () => {
        if (view === "original") return originalLyrics;

        if (view === "translated") return convertedLyrics;

        if (view === "explanation") {
            return (
                explanation?.data?.explanation
                    ?.map((e) => `${e.title}\n${e.content}`)
                    .join("\n\n") || ""
            );
        }

        return "";
    };

    const TabButton = ({ label, active, onClick, icon }: any) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all
      ${active
                    ? "bg-[#111827] text-white border-[#111827]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
        >
            {icon}
            {label}
        </button>
    );

    /* =========================
       ACTIONS
    ========================= */
    const handleTranslate = () => {
        setHasGenerated(true);
        setView("translated");
        convert();
    };

    const handleExplain = () => {
        setHasGenerated(true);
        setView("explanation");
        explain();
    };

    const currentText = getCurrentContent();

    return (
        <div className="min-h-screen bg-[#f7f8fc] text-[#0f172a] font-sans">

            {/* SIDEBAR */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-lg font-bold">Sacred Lyrics</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Editorial Worship Library
                    </p>
                </div>

                <nav className="p-3 space-y-1 text-sm">
                    {["Home", "Library", "Favorites", "Collections", "Settings"].map(
                        (item) => (
                            <div
                                key={item}
                                className="px-4 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600"
                            >
                                {item}
                            </div>
                        )
                    )}
                </nav>

                <div className="mt-auto p-4">
                    <button className="w-full bg-[#111827] text-white py-3 rounded-xl text-sm">
                        Contribute Song
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <div className="md:ml-64">

                {/* TOP BAR */}
                <header className="sticky top-0 bg-white border-b border-slate-200 z-40">
                    <div className="flex items-center justify-between px-10 py-4">
                        <h2 className="text-lg font-semibold">
                            Nepali Christian Bhajan
                        </h2>

                        <input
                            placeholder="Search songs..."
                            className="border border-slate-200 px-4 py-2 rounded-xl w-72 text-sm"
                        />
                    </div>
                </header>

                {/* CONTENT */}
                <main className="max-w-[1200px] mx-auto px-10 py-10 grid xl:grid-cols-[1fr_360px] gap-10">

                    {/* LEFT */}
                    <section>

                        <div className="mb-8">
                            <h1 className="text-4xl font-semibold">
                                {song.title}
                            </h1>
                            <p className="text-slate-500 mt-2 text-sm">
                                Worship • {song.category}
                            </p>
                        </div>

                        {/* TABS */}
                        {hasGenerated && (
                            <div className="flex gap-2 mb-5">
                                <TabButton
                                    label="Original"
                                    active={view === "original"}
                                    onClick={() => setView("original")}
                                    icon={<BookOpenText size={16} />}
                                />
                                <TabButton
                                    label="Translate"
                                    active={view === "translated"}
                                    onClick={() => setView("translated")}
                                    icon={<Languages size={16} />}
                                />
                                <TabButton
                                    label="Meaning"
                                    active={view === "explanation"}
                                    onClick={() => setView("explanation")}
                                    icon={<Sparkles size={16} />}
                                />
                            </div>
                        )}

                        {/* CONTENT BOX */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 min-h-[320px] relative">

                            {/* ACTION BAR */}
                            {hasGenerated && (
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(currentText)}
                                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                                    >
                                        <Copy size={16} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            downloadTxt(song.title, currentText)
                                        }
                                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>
                            )}

                            {/* ORIGINAL */}
                            {view === "original" && (
                                <pre className="whitespace-pre-wrap leading-8 text-slate-800 text-[17px] font-serif">
                                    {originalLyrics}
                                </pre>
                            )}

                            {/* TRANSLATED */}
                            {view === "translated" && (
                                <>
                                    {isLoading ? (
                                        <Skeleton />
                                    ) : (
                                        <pre className="whitespace-pre-wrap leading-8 text-slate-700 text-[17px] font-serif">
                                            {convertedLyrics}
                                        </pre>
                                    )}
                                </>
                            )}

                            {/* EXPLANATION */}
                            {view === "explanation" && (
                                <>
                                    {isLoading ? (
                                        <Skeleton />
                                    ) : (
                                        <div className="space-y-4">
                                            {explanation?.data?.explanation?.map((e, i) => (
                                                <div key={i} className="border-l-2 border-slate-200 pl-4">
                                                    <p className="font-semibold">{e.title}</p>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        {e.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside className="space-y-6">

                        <div className="bg-white border border-slate-200 rounded-2xl p-5">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Languages size={16} /> AI Translation
                            </h3>

                            <SelectField
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                options={LANGUAGES}
                            />

                            <div className="mt-3">
                                <ActionButton onClick={handleTranslate} loading={converting}>
                                    Translate
                                </ActionButton>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Sparkles size={16} /> Meaning
                            </h3>

                            <ActionButton onClick={handleExplain} loading={explaining}>
                                Explain
                            </ActionButton>
                        </div>

                    </aside>
                </main>
            </div>
        </div>
    );
}

/* =========================
   SKELETON
========================= */
function Skeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-11/12" />
            <div className="h-4 bg-slate-100 rounded w-10/12" />
            <div className="h-4 bg-slate-100 rounded w-8/12" />
        </div>
    );
}