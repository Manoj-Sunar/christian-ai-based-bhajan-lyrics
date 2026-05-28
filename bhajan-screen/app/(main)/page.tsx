import type { Metadata } from "next";
import Hero from "../components/home/Hero";
import TrendingSection from "../components/Bhajan/TrendingSectionCard";
import RecentList from "../components/Bhajan/RecentListCard";
import { getAllSongsServer } from "../lib/song.server";


const APP_NAME = "Prabhu Ko Stuti";
const SITE_URL = "https://yourdomain.com";

export const revalidate = 3600;

/**
 * ✅ Dynamic Metadata (SEO optimized, SSR-ready)
 */
export async function generateMetadata(): Promise<Metadata> {
  const songs = await getAllSongsServer();

  const latestSong = songs?.[0];

  return {
    metadataBase: new URL(SITE_URL),

    title: {
      default: `${APP_NAME} | Nepali Christian Bhajans & Worship Songs`,
      template: `%s | ${APP_NAME}`,
    },

    description: latestSong
      ? `Listen to ${latestSong.title} and explore Nepali Christian bhajans, worship songs, and spiritual music.`
      : "Explore Nepali Christian bhajans, worship songs, lyrics, and spiritual music.",

    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: APP_NAME,

      title: `${APP_NAME} | Worship & Bhajans`,
      description:
        "Discover trending Nepali Christian bhajans and worship songs.",

      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: APP_NAME,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${APP_NAME}`,
      description: "Nepali Christian worship songs & bhajans.",
      images: ["/og-image.jpg"],
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * JSON-LD
 */
function generateJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * HOME PAGE (SSR)
 */
export default async function HomePage() {
  const songs = await getAllSongsServer();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJsonLd()),
        }}
      />

      <main className="min-h-screen overflow-x-hidden bg-background">
        <section>
          <Hero />
        </section>

        <section aria-label="Trending Bhajans" className="scroll-mt-24">
          <TrendingSection bhajans={songs} />
        </section>

        <section className="px-6 py-16 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-12">
              <RecentList recentBhajan={songs} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}