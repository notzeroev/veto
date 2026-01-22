import type React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/utils/convex/ConvexClientProvider";
import { Header } from "@/components/layout/Header";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <html lang="en" className={cn("dark", jetbrainsMono.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        <ConvexClientProvider>
          <Header />
          <main>{children}</main>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
