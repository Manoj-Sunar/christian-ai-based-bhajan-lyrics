"use client";

import { memo, useCallback } from "react";

import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Music2,
    Sparkles,
    GripVertical,
    X,
    Tag,
    ListMusic,
    Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

import {
    useForm,
    useFieldArray,
    Controller,
    useWatch,
    Control,
} from "react-hook-form";

import {
    LyricSection,
    Song,
    SongCategory,
    SongTempo,
} from "@/app/types";


import SwitchField from "@/app/components/UI/SwitchField";

import { useMutation } from "@tanstack/react-query";

import { adminApi } from "@/app/API/admin.api";
import { InputField } from "@/app/components/UI/InputField";
import { SelectField } from "@/app/components/UI/SelectField";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

interface SongEditorProps {
    onBack: () => void;
    onSave?: (song: Partial<Song>) => void;
    initialSong?: Song;
}

type FormValues = Partial<Song>;

/* -------------------------------------------------------------------------- */
/* HELPERS */
/* -------------------------------------------------------------------------- */

const createSection = (name: string): LyricSection => ({
    id: crypto.randomUUID(),
    name,
    lines: [""],
    chords: [[]],
    repeat: 1,
});

/* -------------------------------------------------------------------------- */
/* LINE EDITOR */
/* -------------------------------------------------------------------------- */

interface LineEditorProps {
    chords: string[];
    sectionIndex: number;
    lineIndex: number;
    control: Control<FormValues>;

    removeLine: (
        sectionIndex: number,
        lineIndex: number
    ) => void;

    addChord: (
        sectionIndex: number,
        lineIndex: number,
        chord: string
    ) => void;

    removeChord: (
        sectionIndex: number,
        lineIndex: number,
        chordIndex: number
    ) => void;
}

const LineEditor = memo(
    ({
        chords,
        sectionIndex,
        lineIndex,
        control,
        removeLine,
        addChord,
        removeChord,
    }: LineEditorProps) => {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-4">
                {/* CHORDS */}

                <div className="flex flex-wrap gap-2 items-center">
                    {chords.map(
                        (
                            chord: string,
                            chordIndex: number
                        ) => (
                            <div
                                key={`${chord}-${chordIndex}`}
                                className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1"
                            >
                                {chord}

                                <button
                                    type="button"
                                    onClick={() =>
                                        removeChord(
                                            sectionIndex,
                                            lineIndex,
                                            chordIndex
                                        )
                                    }
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        )
                    )}

                    <input
                        placeholder="+ Chord"
                        className="bg-slate-100 rounded-lg px-3 py-1 text-xs outline-none w-24"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();

                                const value =
                                    (
                                        e.target as HTMLInputElement
                                    ).value;

                                addChord(
                                    sectionIndex,
                                    lineIndex,
                                    value
                                );

                                (
                                    e.target as HTMLInputElement
                                ).value = "";
                            }
                        }}
                    />
                </div>

                {/* LYRIC LINE */}

                <div className="flex gap-3 items-start">
                    <Controller
                        control={control}
                        name={`lyrics.${sectionIndex}.lines.${lineIndex}`}
                        render={({ field }) => (
                            <input
                                {...field}
                                placeholder="Enter lyric..."
                                className="flex-1 bg-transparent border-b border-slate-200 pb-2 outline-none focus:border-indigo-500 transition"
                            />
                        )}
                    />

                    <button
                        type="button"
                        onClick={() =>
                            removeLine(
                                sectionIndex,
                                lineIndex
                            )
                        }
                        className="text-slate-400 hover:text-red-500 transition"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        );
    }
);

LineEditor.displayName = "LineEditor";





/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT */
/* -------------------------------------------------------------------------- */

export default function SongEditor({
    onBack,
    initialSong,
}: SongEditorProps) {
    /* ---------------------------------------------------------------------- */
    /* FORM */
    /* ---------------------------------------------------------------------- */

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
    } = useForm<FormValues>({
        defaultValues:
            initialSong || {
                title: "",
                number: 1,
                category: SongCategory.WORSHIP,
                tempo: SongTempo.MEDIUM,
                scale: "C Major",
                isActive: true,
                tags: [],
                lyrics: [],
            },
    });

    const {
        fields: lyricSections,
        append,
        remove,
    } = useFieldArray({
        control,
        name: "lyrics",
    });

    const lyrics =
        useWatch({
            control,
            name: "lyrics",
        }) || [];

    /* ---------------------------------------------------------------------- */
    /* UPDATE HELPERS */
    /* ---------------------------------------------------------------------- */

    const updateLyrics = useCallback(
        (updatedLyrics: LyricSection[]) => {
            setValue("lyrics", updatedLyrics, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
        },
        [setValue]
    );

    /* ---------------------------------------------------------------------- */
    /* SECTION CRUD */
    /* ---------------------------------------------------------------------- */

    const addSection = useCallback(
        (name: string) => {
            append(createSection(name));
        },
        [append]
    );

    const removeSection = useCallback(
        (index: number) => {
            remove(index);
        },
        [remove]
    );

    /* ---------------------------------------------------------------------- */
    /* LINE CRUD */
    /* ---------------------------------------------------------------------- */

    const addLine = useCallback(
        (sectionIndex: number) => {
            const currentSections =
                getValues("lyrics") || [];

            const section =
                currentSections[sectionIndex];

            if (!section) return;

            const updatedSection = {
                ...section,
                lines: [...section.lines, ""],
                chords: [...section.chords, []],
            };

            setValue(
                `lyrics.${sectionIndex}`,
                updatedSection,
                {
                    shouldDirty: true,
                }
            );
        },
        [getValues, setValue]
    );

    const removeLine = useCallback(
        (
            sectionIndex: number,
            lineIndex: number
        ) => {
            const currentSections =
                getValues("lyrics") || [];

            const section =
                currentSections[sectionIndex];

            if (!section) return;

            const updatedSection = {
                ...section,

                lines:
                    section.lines.filter(
                        (_, i) => i !== lineIndex
                    ) || [],

                chords:
                    section.chords.filter(
                        (_, i) => i !== lineIndex
                    ) || [],
            };

            setValue(
                `lyrics.${sectionIndex}`,
                {
                    ...updatedSection,
                    lines:
                        updatedSection.lines.length >
                            0
                            ? updatedSection.lines
                            : [""],

                    chords:
                        updatedSection.chords.length >
                            0
                            ? updatedSection.chords
                            : [[]],
                },
                {
                    shouldDirty: true,
                }
            );
        },
        [getValues, setValue]
    );

    /* ---------------------------------------------------------------------- */
    /* CHORD CRUD */
    /* ---------------------------------------------------------------------- */

    const addChord = useCallback(
        (
            sectionIndex: number,
            lineIndex: number,
            chord: string
        ) => {
            if (!chord.trim()) return;

            const updatedLyrics = [...lyrics];

            const section =
                updatedLyrics[sectionIndex];

            if (!section) return;

            if (!section.chords) {
                section.chords = [];
            }

            if (!section.chords[lineIndex]) {
                section.chords[lineIndex] = [];
            }

            section.chords[lineIndex] = [
                ...new Set([
                    ...section.chords[lineIndex],
                    chord.trim(),
                ]),
            ];

            updateLyrics(updatedLyrics);
        },
        [lyrics, updateLyrics]
    );

    const removeChord = useCallback(
        (
            sectionIndex: number,
            lineIndex: number,
            chordIndex: number
        ) => {
            const updatedLyrics = [...lyrics];

            const section =
                updatedLyrics[sectionIndex];

            if (!section) return;

            if (!section.chords[lineIndex]) return;

            section.chords[lineIndex] =
                section.chords[lineIndex].filter(
                    (_, idx) =>
                        idx !== chordIndex
                );

            updateLyrics(updatedLyrics);
        },
        [lyrics, updateLyrics]
    );

    /* ---------------------------------------------------------------------- */
    /* SAVE */
    /* ---------------------------------------------------------------------- */

    const { isPending, mutateAsync } =
        useMutation({
            mutationFn: adminApi.createLyrics,

            onSuccess: (data) => {
                console.log(
                    "Song saved:",
                    data
                );
            },

            onError: (error) => {
                console.log(error);
            },
        });

    const submitHandler = async (
        data: FormValues
    ) => {
        const cleanedLyrics = (
            data.lyrics || []
        ).map((section) => ({
            ...section,

            lines: (section.lines || []).map(
                (line) => line.trim()
            ),

            chords: (
                section.chords || []
            ).map((lineChords) =>
                Array.isArray(lineChords)
                    ? lineChords.filter(
                        (chord) =>
                            chord.trim() !== ""
                    )
                    : []
            ),
        }));

        const finalData = {
            ...data,
            lyrics: cleanedLyrics,
        };

        console.log(finalData);

        await mutateAsync(finalData);
    };

    /* ---------------------------------------------------------------------- */
    /* JSX */
    /* ---------------------------------------------------------------------- */

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto space-y-8 pb-24"
        >
            {/* HEADER */}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="p-3 bg-white border rounded-2xl hover:bg-slate-50 transition"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-3xl font-black tracking-tight">
                            {initialSong
                                ? "Edit Song"
                                : "Create Song"}
                        </h1>

                        <p className="text-slate-500 mt-1 text-sm">
                            Manage worship lyrics,
                            chords and metadata
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleSubmit(
                        submitHandler
                    )}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-100 transition active:scale-95"
                >
                    <Save size={18} />

                    {isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        "Save Song"
                    )}
                </button>
            </div>

            {/* CONTENT */}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* LEFT */}

                <div className="xl:col-span-2 space-y-8">
                    {/* BASIC INFO */}

                    <section className="bg-white border border-gray-50 rounded-3xl p-8 shadow-sm space-y-6">
                        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                            <Music2 size={16} />
                            Basic Information
                        </h2>

                        <div className="space-y-6">
                            <InputField
                                label="Song Title"
                                placeholder="Amazing Grace"
                                {...register("title")}
                            />

                            <InputField
                                label="Bhajan No."
                                placeholder="101"
                                type="number"
                                {...register("number", {
                                    valueAsNumber: true,
                                })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField
                                    label="Scale / Key"
                                    placeholder="C Major"
                                    {...register("scale")}
                                />

                                <SelectField
                                    label="Tempo"
                                    {...register("tempo")}
                                    options={Object.values(
                                        SongTempo
                                    ).map((tempo) => ({
                                        label: tempo,
                                        value: tempo,
                                    }))}
                                />

                                <SelectField
                                    label="Category"
                                    {...register(
                                        "category"
                                    )}
                                    options={Object.values(
                                        SongCategory
                                    ).map(
                                        (category) => ({
                                            label:
                                                category,
                                            value:
                                                category,
                                        })
                                    )}
                                />
                            </div>
                        </div>
                    </section>

                    {/* LYRICS */}

                    <section className="bg-white border border-gray-50 rounded-3xl p-8 shadow-sm space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                                <ListMusic size={16} />
                                Lyrics & Chords
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Verse",
                                    "Chorus",
                                    "Bridge",
                                ].map((section) => (
                                    <button
                                        key={section}
                                        type="button"
                                        onClick={() =>
                                            addSection(
                                                section
                                            )
                                        }
                                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-xs font-bold transition"
                                    >
                                        + {section}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SECTIONS */}

                        <div className="space-y-6">
                            {lyricSections.map(
                                (
                                    section,
                                    sectionIndex
                                ) => (
                                    <div
                                        key={section.id}
                                        className="bg-slate-50 border border-gray-100 rounded-3xl p-6"
                                    >
                                        {/* SECTION HEADER */}

                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <GripVertical
                                                    size={18}
                                                    className="text-slate-300"
                                                />

                                                <input
                                                    {...register(
                                                        `lyrics.${sectionIndex}.name`
                                                    )}
                                                    className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest outline-none"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeSection(
                                                        sectionIndex
                                                    )
                                                }
                                                className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                                            >
                                                <Trash2
                                                    size={18}
                                                />
                                            </button>
                                        </div>

                                        {/* LINES */}

                                        <div className="space-y-4">
                                            {lyrics?.[
                                                sectionIndex
                                            ]?.lines?.map(
                                                (
                                                    _line,
                                                    lineIndex
                                                ) => (
                                                    <LineEditor
                                                        key={`${section.id}-${lineIndex}`}
                                                        chords={
                                                            lyrics?.[
                                                                sectionIndex
                                                            ]
                                                                ?.chords?.[
                                                            lineIndex
                                                            ] ||
                                                            []
                                                        }
                                                        sectionIndex={
                                                            sectionIndex
                                                        }
                                                        lineIndex={
                                                            lineIndex
                                                        }
                                                        control={
                                                            control
                                                        }
                                                        removeLine={
                                                            removeLine
                                                        }
                                                        addChord={
                                                            addChord
                                                        }
                                                        removeChord={
                                                            removeChord
                                                        }
                                                    />
                                                )
                                            )}

                                            {/* ADD LINE */}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addLine(
                                                        sectionIndex
                                                    )
                                                }
                                                className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-3 text-sm font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition"
                                            >
                                                <Plus
                                                    size={16}
                                                    className="inline mr-2"
                                                />
                                                Add Line
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}

                            {/* EMPTY */}

                            {lyricSections.length ===
                                0 && (
                                    <div className="border-2 border-dashed border-slate-200 rounded-3xl py-20 text-center">
                                        <Music2
                                            size={48}
                                            className="mx-auto text-slate-300 mb-4"
                                        />

                                        <p className="text-slate-400 font-bold">
                                            No sections added
                                            yet
                                        </p>
                                    </div>
                                )}
                        </div>
                    </section>
                </div>

                {/* RIGHT */}

                <div className="space-y-6">
                    {/* STATUS */}

                    <section className="bg-white border border-gray-50 rounded-3xl p-6 shadow-xs">
                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                            <Tag size={16} />
                            Status
                        </h3>

                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <SwitchField
                                    label="Song Active"
                                    value={
                                        field.value ??
                                        false
                                    }
                                    onChange={
                                        field.onChange
                                    }
                                />
                            )}
                        />
                    </section>

                    {/* SMART EDITOR */}

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-3xl p-8 shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <Sparkles className="absolute right-0 top-0 w-24 h-24 text-white/10" />

                        <h3 className="text-xl font-black mb-4 relative z-10">
                            Smart Editor ✨
                        </h3>

                        <p className="text-indigo-100 text-sm leading-relaxed relative z-10">
                            Type chords like
                            <code className="bg-white/10 px-1 rounded mx-1">
                                [G]
                            </code>
                            directly inside lyric
                            lines to auto-extract them
                            instantly.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}