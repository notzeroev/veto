import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "@/utils/convex/ConvexClientProvider";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "vet0",
  description: "Simple, real-time map veto for competitive matches.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen`}>
        <ConvexClientProvider>
          <header className="border-b border-zinc-800 px-6 py-4">
            <div className="container mx-auto flex items-center justify-between">
              <Link href="/" className="text-xl font-bold hover:text-zinc-300 transition-colors">
                vet0
              </Link>
            </div>
          </header>
          <main>{children}</main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
