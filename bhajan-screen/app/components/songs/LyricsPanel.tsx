"use client";

import { memo } from "react";
import { Song } from "@/app/types";

export const LyricsPanel = memo(function LyricsPanel({
  title,
  song,
}: {
  title: string;
  song: Song;
}) {
  return (
   <div className="space-y-10">

                {song.lyrics.map((sec, i) => (
                  <div key={i} className="space-y-4">

                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600">
                      {sec.name}
                    </h3>

                    {sec.lines.map((line, j) => (
                      <div key={j} className="space-y-2">

                        {(sec.chords?.[j]?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {sec.chords[j].map((c, k) => (
                              <span
                                key={k}
                                className="text-xs font-mono bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100 shadow-sm"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-[15px] sm:text-base lg:text-lg font-semibold text-slate-800 leading-8 tracking-wide">
                          {line}
                        </p>
                      </div>
                    ))}

                  </div>
                ))}

              </div>
  );
});