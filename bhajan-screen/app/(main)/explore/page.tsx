import type { Metadata } from "next";
import LyricsPanel from "@/app/components/Explore/LyricsPanel";
import { Song } from "@/app/types";

import { getAllSongsServer } from "@/app/lib/song.server";

const SITE_URL = "https://yourdomain.com";

export const revalidate = 3600;

/**
 * STATIC METADATA (clean + stable)
 */
export const metadata: Metadata = {
  title: "Explore Bhajans & Worship Songs",
  description:
    "Browse Nepali Christian bhajans, worship lyrics, devotional songs, categories, and spiritual music.",

  alternates: {
    canonical: "/explore",
  },

  openGraph: {
    title: "Explore Bhajans & Worship Songs",
    description: "Discover worship songs and lyrics.",
    url: `${SITE_URL}/explore`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Explore Bhajans",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Explore Bhajans",
    description: "Browse Nepali Christian worship songs.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

/**
 * DYNAMIC JSON-LD (SSR)
 */
function generateJsonLd(songs: Song[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Explore Bhajans",
    url: `${SITE_URL}/explore`,

    mainEntity: songs.slice(0, 10).map((song) => ({
      "@type": "MusicComposition",
      name: song.title,
      url: `${SITE_URL}/explore/${song.slug || song._id}`,
      keywords: song.tags?.join(", "),
      genre: song.category,
      datePublished: song.createdAt,
    })),
  };
}

/**
 * EXPLORE PAGE (SSR)
 */
export default async function ExplorePage() {
  const songs = await getAllSongsServer();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd(songs)),
        }}
      />

      <main className="h-full" aria-label="Explore worship songs">
        <LyricsPanel songs={songs} />
      </main>
    </>
  );
}