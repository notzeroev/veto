import type React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/utils/convex/ConvexClientProvider";
import { getToken } from "@/lib/auth-server";
import "./globals.css";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "vet0",
  description: "Simple, real-time map veto for VALORANT",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  return (
    <html lang="en" className={cn("dark", jetbrainsMono.variable)}>
      <body className="min-h-screen bg-background text-foreground">
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
