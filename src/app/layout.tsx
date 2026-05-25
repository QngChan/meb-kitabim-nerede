import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEB Kitabım Nerede",
  description: "Milli Eğitim Bakanlığı resmi ders kitaplarına hızlı erişim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <header className="header">
          <div className="container">
            <a href="/" className="logo">MEB Kitabım Nerede</a>
            <nav>
              <a href="/">Ana Sayfa</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="footer">
          <div className="container">
            <p>İçerikler Milli Eğitim Bakanlığı OGM Materyal kaynağından alınmaktadır.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
