

export enum SongCategory {
  WORSHIP = "worship",
  PRAISE = "praise",
  YOUTH = "youth",
}

export enum SongTempo {
  SLOW = "slow",
  MEDIUM = "medium",
  FAST = "fast",
}

/**
 * IMPORTANT:
 * chords is REQUIRED and NEVER optional
 */
export interface LyricSection {
  id?: string;
  name?: string;
  lines: string[];
  chords: string[][];
  repeat?: number;
}

export interface Song {
  _id: string;
  title: string;
  slug: string;
  number: number;
  category: SongCategory;
  scale: string;
  tempo: SongTempo;
  lyrics: LyricSection[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface AllSongsResponse {
  success: boolean;
  message: string;
  data: Song[];
}

export interface SongDetailsResponse {
  success: boolean;
  message: string;
  data: Song;
}


export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface ConvertLyricsResponse {
  success: boolean;
  message: string;
  data: {
    convertedSong: Song;
    language: string;
    originalSongId: string;
  };
}




// type of explain lyrics response
interface ExplainContent {
  title: string,
  content: string,
}

interface SongExplanation {
  song: string,
  explanation: ExplainContent[],
}


export interface ExplainLyricsResponse {
  success: boolean;
  message: string;
  data: SongExplanation
}

export type View =
  | "/admin/dashboard"
  | "/admin/songs"
  | "/admin/song-editor"
  | "settings";