import { SongCategory, SongTempo } from "../types";


export const MOCK_SONGS = [
  {
    id: "1",
    title: "Amazing Grace",
    category: SongCategory.WORSHIP,
    scale: "G Major",
    tempo: SongTempo.MEDIUM,
    lyrics: [],
    tags: ["grace", "worship"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];