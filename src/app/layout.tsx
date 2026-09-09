import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { HeaderAuth } from "@/components/HeaderAuth";

export const metadata: Metadata = {
  title: "HomeFoodAway — find your home-country food abroad",
  description:
    "A locator for Ireland-origin food and products: find where they're actually stocked near you, wherever you are.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold text-emerald-700">
              <span aria-hidden>🧭</span> HomeFoodAway
            </Link>
            <HeaderAuth />
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 bg-white py-6 text-center text-sm text-neutral-500">
          HomeFoodAway — v1 scaffold. Ireland-origin products, one city at a time.
        </footer>
      </body>
    </html>
  );
}
