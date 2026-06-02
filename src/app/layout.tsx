import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ניהול נכסים — הנכס בבלעדיות",
  description: "מערכת לניהול נכסי תיווך, מעקב בלעדיות, תמונות וסרטונים",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur no-print">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
                  ה
                </span>
                <span className="text-lg font-extrabold text-slate-800">ניהול נכסים</span>
              </Link>
              <nav className="flex items-center gap-2">
                <Link href="/" className="btn btn-secondary">
                  לוח בקרה
                </Link>
                <Link href="/settings" className="btn btn-secondary">
                  הגדרות
                </Link>
                <Link href="/properties/new" className="btn btn-primary">
                  + נכס חדש
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
