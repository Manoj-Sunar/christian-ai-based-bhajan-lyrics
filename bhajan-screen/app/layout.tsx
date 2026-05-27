import Footer from "./components/Layout/Footer";
import "./globals.css";
import QueryProvider from "./providers/QueryProvider";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
       

        <main >
          <QueryProvider>

          {children}
          </QueryProvider>
        </main>
        <Footer/>
      </body>
    </html>
  );
}