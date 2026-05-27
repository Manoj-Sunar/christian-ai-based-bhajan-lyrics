import Navbar from "../components/Layout/Navbar";
import Sidebar from "../components/Layout/Sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <Navbar />
      <Sidebar />

      <main className="lg:pl-64 pt-16">
        {children}
      </main>
    </div>
  );
}