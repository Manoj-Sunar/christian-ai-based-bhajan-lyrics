// app/explore/[songId]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock3, Music2, Tag, Hash } from "lucide-react";

import { publicApi } from "@/app/API/public.api";
import { Song } from "@/app/types";

const SITE_NAME = "Prabhu Ko Stuti";
const SITE_URL = "https://yourdomain.com";

interface IParams {
  params: Promise<{
    songId: string;
  }>;
}

export const revalidate = 60;
export const dynamicParams = true;

/* -------------------------------------------------------------------------- */
/*                                   FETCH                                    */
/* -------------------------------------------------------------------------- */

async function getSong(songId: string): Promise<Song> {
  try {
    const res = await publicApi.getSongById(songId, {
      next: {
        revalidate: 60,
      },
    });

    if (!res?.data) {
      notFound();
    }

    return res.data;
  } catch (error) {
    console.error("Song Fetch Error:", error);
    notFound();
  }
}

/* -------------------------------------------------------------------------- */
/*                                     SEO                                    */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: IParams): Promise<Metadata> {
  const { songId } = await params;

  const song = await getSong(songId);

  const description = `${song.title} lyrics with chords, worship song in ${song.scale}, ${song.tempo} tempo. Read complete Nepali Christian bhajan lyrics and worship verses.`;

  return {
    title: `${song.title} Lyrics & Chords | ${SITE_NAME}`,

    description,

    keywords: [
      song.title,
      song.category,
      song.scale,
      song.tempo,
      ...(song.tags || []),
      "Nepali Christian songs",
      "Bhajan lyrics",
      "Worship chords",
      "Christian worship songs",
      "Gospel Nepal",
    ],

    alternates: {
      canonical: `/explore/${songId}`,
    },

    openGraph: {
      type: "article",

      title: `${song.title} Lyrics & Chords`,

      description,

      url: `${SITE_URL}/explore/${songId}`,

      siteName: SITE_NAME,

      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: song.title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${song.title} Lyrics & Chords`,
      description,
      images: ["/og-image.jpg"],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                               STRUCTURED DATA                              */
/* -------------------------------------------------------------------------- */

function generateJsonLd(song: Song) {
  return {
    "@context": "https://schema.org",

    "@type": "MusicComposition",

    name: song.title,

    genre: song.category,

    url: `${SITE_URL}/explore/${song._id}`,

    datePublished: song.createdAt,

    dateModified: song.updatedAt,

    keywords: song.tags?.join(", "),

    inLanguage: "ne",

    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

const SongDetails = async ({ params }: IParams) => {
  const { songId } = await params;

  const song = await getSong(songId);

  return (
    <>
      {/* JSON LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd(song)),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border border-gray-200">
          {/* Glow Effects */}
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-6 py-16 md:px-10">
            {/* TOP BADGES */}
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary backdrop-blur">
                <Hash size={14} />
                {song.number}
              </div>

              <div className="rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-sm capitalize text-secondary backdrop-blur">
                {song.category}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm backdrop-blur">
                <Music2 size={14} />
                {song.scale}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm capitalize backdrop-blur">
                <Clock3 size={14} />
                {song.tempo}
              </div>
            </div>

            {/* TITLE */}
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
              {song.title}
            </h1>

            {/* SUBTITLE */}
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              Worship lyrics with chords, beautifully formatted for singing,
              live worship, practice sessions, and devotional reading.
            </p>

            {/* TAGS */}
            {song.tags?.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {song.tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm"
                  >
                    <Tag size={14} />
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
          <div className="space-y-10">
            {song.lyrics?.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="overflow-hidden rounded-[10px] border border-border border-gray-100 bg-card/80 shadow-xs backdrop-blur"
              >
                {/* SECTION HEADER */}
                <div className="border-b border-border border-gray-200 bg-muted/40 px-6 py-5 md:px-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        {section.name}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Repeat × {section.repeat}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                      Section {sectionIndex + 1}
                    </div>
                  </div>
                </div>

                {/* LYRICS */}
                <div className="px-5 py-8 md:px-8 md:py-10">
                  <div className="space-y-8">
                    {section.lines?.map((line, index) => {
                      const chord = section.chords?.[index]?.[0];

                      return (
                        <div
                          key={index}
                          className="group relative rounded-2xl border border-transparent p-4 transition-all duration-300 hover:border-primary/20 hover:bg-primary/[0.03]"
                        >
                        

                          {/* CHORD */}
                          {chord && (
                            <div className="mb-2 inline-flex items-center rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold tracking-wide text-primary shadow-sm">
                              ♪ {chord}
                            </div>
                          )}

                          {/* LYRIC */}
                          <p className="text-xl leading-[2.2rem] tracking-wide text-foreground md:text-2xl">
                            {line}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

         
        </section>
      </main>
    </>
  );
};

export default SongDetails;