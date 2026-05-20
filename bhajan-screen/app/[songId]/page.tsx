import { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicApi } from "../API/public.api";
import SongDetail from "../components/song-details/SongDetails";



interface SongPageProps {
    params: {
        songId: string;
    };
}

/**
 * Optional SEO metadata
 */
export async function generateMetadata({
    params,
}: SongPageProps): Promise<Metadata> {

    const { songId } = await params;
    return {
        title: `Song ${songId}`,
        description: `Details page for song ${songId}`,
    };
}

/**
 * Example API fetch function
 * Replace with your real database/API call
 */
async function getSong(songId: string) {
    try {
        const res = await publicApi.getSongById(songId);
        return res.data;
    } catch (error) {
        console.error("Error fetching song:", error);
        return null;
    }
}



const SongsPage = async ({ params }: SongPageProps) => {
    const { songId } = await params;

    /**
     * Validate route param
     */
    if (!songId || typeof songId !== "string") {
        notFound();
    }

    /**
     * Fetch song data
     */
    const song = await getSong(songId);
   console.log(song)

    /**
     * Handle missing song
     */
    if (!song) {
        notFound();
    }

    return (
        <main className="">
            <SongDetail song={song}/>
        </main>
    );
};

export default SongsPage;