import AIPanel from "@/app/components/Explore/AIPanel";
import { SongProvider } from "@/app/providers/SongContext";


export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   <SongProvider>
     <div className="bg-surface text-on-surface min-h-screen font-body-md overflow-hidden">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Side */}
        <div className="lg:w-[68%] min-h-0 border-r border-outline-variant/10 overflow-y-auto">
          {children}
        </div>

        {/* Right Side */}
        <div className="lg:w-[40%] min-h-0">
          <AIPanel/>
        </div>
      </div>
    </div>
   </SongProvider>
  );
}