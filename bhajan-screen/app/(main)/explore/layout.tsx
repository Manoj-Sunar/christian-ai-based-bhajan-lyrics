import AIPanel from "@/app/components/Explore/AIPanel";
import { SongProvider } from "@/app/providers/SongContext";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SongProvider>
      <div className="min-h-screen bg-surface text-on-surface overflow-hidden">

        <div className="flex flex-col lg:flex-row h-[100dvh]">

          {/* LEFT SIDE */}
          <div className="flex-1 min-h-0 overflow-y-auto border-r border-zinc-200">
            {children}
          </div>

          {/* RIGHT SIDE (DESKTOP ONLY PANEL) */}
          <div className="
            hidden lg:flex
            lg:w-[40%]
            h-full
            border-l
            border-zinc-200
          ">
            <AIPanel />
          </div>

        </div>

        {/* MOBILE FLOATING AI BUTTON (OPENS PANEL LATER if needed) */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <MobileAIButton />
        </div>

      </div>
    </SongProvider>
  );
}

/**
 * OPTIONAL (you can later expand to modal drawer)
 */
function MobileAIButton() {
  return (
    <div className="rounded-full bg-fuchsia-600 text-white px-4 py-3 shadow-lg">
      AI
    </div>
  );
}