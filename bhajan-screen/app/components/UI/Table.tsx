"use client";

import React, { memo } from "react";
import { ArrowUpDown, Edit2, Trash2 } from "lucide-react";

import { Song, SongCategory } from "@/app/types";
import { cn } from "@/app/lib/utils";

interface TableProps {
  songs: Song[];
  isAuthenticated?: boolean;
  isDeleting?: boolean;

  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (song: Song) => void;
}

const Table = ({
  songs,
  onSelectSong,
  onEditSong,
  onDeleteSong,
  isAuthenticated = false,
  isDeleting = false,
}: TableProps) => {
  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(new Date(date));
  };

  if (!songs.length) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white">
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-700">
            No Songs Found
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Add your first song to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["#", "Title", "Details", "Tempo/Key", "Status", "Actions"].map(
                (item) => (
                  <th
                    key={item}
                    className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400"
                  >
                    {item}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {songs.map((song, index) => (
              <tr
                key={song._id}
                onClick={() => onSelectSong(song)}
                className="group cursor-pointer transition-colors hover:bg-slate-50/60"
              >
                {/* Number */}
                <td className="px-6 py-5">
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-600">
                    {song.number || index + 1}
                  </span>
                </td>

                {/* Title */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 font-bold text-indigo-600 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                      {song.title?.charAt(0)}
                    </div>

                    <div>
                      <h4 className="font-bold uppercase tracking-tight text-slate-900 group-hover:text-indigo-600">
                        {song.title}
                      </h4>

                      <div className="mt-1 flex flex-wrap gap-2">
                        {song.tags?.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Details */}
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "mb-1 w-fit rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider",
                        song.category === SongCategory.WORSHIP
                          ? "bg-indigo-100 text-indigo-600"
                          : song.category === SongCategory.PRAISE
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {song.category}
                    </span>

                    <span className="text-xs text-slate-400">
                      {formatDate(song.updatedAt)}
                    </span>
                  </div>
                </td>

                {/* Tempo */}
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-600">
                      {song.scale}
                    </span>

                    <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                      <ArrowUpDown size={12} />
                      {song.tempo}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-5">
                  {song.isActive ? (
                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-600">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                      DRAFT
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-5">
                  {isAuthenticated && (
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSong(song);
                        }}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSong(song);
                        }}
                        className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="grid gap-4 lg:hidden">
        {songs.map((song) => (
          <div
            key={song._id}
            onClick={() => onSelectSong(song)}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900">{song.title}</h3>

                <div className="mt-2 flex flex-wrap gap-2">
                  {song.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold">
                {song.scale}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {formatDate(song.updatedAt)}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSong(song);
                  }}
                  className="rounded-lg p-2 hover:bg-indigo-50"
                >
                  <Edit2 size={16} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSong(song);
                  }}
                  className="rounded-lg p-2 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default memo(Table);