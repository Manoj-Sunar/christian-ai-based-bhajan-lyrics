"use client";

import React, { useCallback } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Table from "../UI/Table";

import { publicApi } from "@/app/API/public.api";
import { adminApi } from "@/app/API/admin.api";

import {
  AllSongsResponse,
  DeleteResponse,
  Song,
} from "@/app/types";

export default function SongList() {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<AllSongsResponse>({
    queryKey: ["songs"],
    queryFn: publicApi.getAllSongs,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: adminApi.deleteLyrics,

    onSuccess: (_data: DeleteResponse) => {
      queryClient.invalidateQueries({
        queryKey: ["songs"],
      });
    },

    onError: (error) => {
      console.error(error);
    },
  });

  const handleSelectSong = useCallback(
    (song: Song) => {
      router.push(`/songs/${song._id}`);
    },
    [router]
  );

  const handleEditSong = useCallback(
    (song: Song) => {
      router.push(`/admin/songs/edit/${song._id}`);
    },
    [router]
  );

  const handleDeleteSong = useCallback(
    (song: Song) => {
      const confirmDelete = window.confirm(
        `Delete "${song.title}" ?`
      );

      if (!confirmDelete) return;

      mutate(song._id);
    },
    [mutate]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600">
        Failed to load songs.
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Songs
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage worship songs and lyrics
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-bold text-slate-600">
            Total Songs: {data?.data?.length || 0}
          </span>
        </div>
      </div>

      <Table
        songs={data?.data || []}
        isAuthenticated
        isDeleting={isPending}
        onSelectSong={handleSelectSong}
        onEditSong={handleEditSong}
        onDeleteSong={handleDeleteSong}
      />
    </section>
  );
}