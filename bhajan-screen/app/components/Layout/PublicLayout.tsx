import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      
      {/* Sidebar (desktop only like your reference) */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 md:ml-64 flex flex-col">

        {/* Topbar */}
        <Topbar />

        {/* Content */}
        <main className="max-w-6xl mx-auto w-full px-4 md:px-10 py-10">
          {children}
        </main>
      </div>
    </div>
  );
}