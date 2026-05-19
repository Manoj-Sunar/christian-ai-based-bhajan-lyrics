import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "Nepali Christian Bhajan & Chorus Lyrics",
    template: "%s | Nepali Bhajan Lyrics",
  },

  description:
    "All Nepali Christian Bhajan and Chorus lyrics in one place. Search by number, title, or keywords. Easy, fast, and mobile-friendly.",

  keywords: [
    "Nepali Bhajan",
    "Christian Bhajan Nepal",
    "Nepali Chorus Lyrics",
    "Bhajan 505",
    "Mahima Mariyeko Thuma Lai lyrics",
  ],

  authors: [{ name: "Your Website Name" }],

  openGraph: {
    title: "Nepali Christian Bhajan & Chorus",
    description:
      "Find all Nepali Christian Bhajan and Chorus lyrics easily.",
    url: "https://yourdomain.com",
    siteName: "Nepali Bhajan Lyrics",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Nepali Christian Bhajan Lyrics",
    description: "Search and read all Nepali Bhajan lyrics",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${poppins.className} min-h-full flex flex-col`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}