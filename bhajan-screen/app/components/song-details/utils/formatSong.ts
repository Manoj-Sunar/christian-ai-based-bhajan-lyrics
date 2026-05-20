import { Song } from "@/app/types";

export const formatSongLyrics = (song: Song) => {
  return song.lyrics
    .map((sec) => {
      const sectionText = sec.lines
        .map((line, i) => {
          const chords = sec.chords?.[i]?.length
            ? `\n${sec.chords[i].join("  ")}`
            : "";

          return `${chords}\n${line}`;
        })
        .join("\n");

      return `[${sec.name}]\n${sectionText}`;
    })
    .join("\n\n");
};