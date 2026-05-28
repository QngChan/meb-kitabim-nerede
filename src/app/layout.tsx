import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./header";
import Footer from "./footer";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MEB Kitabım Nerede",
  description: "Milli Eğitim Bakanlığı resmi ders kitaplarına hızlı ve ücretsiz erişim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var t = localStorage.getItem('theme');
                var d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', d);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body className={inter.variable}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
