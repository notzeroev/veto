import type React from "react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ConvexClientProvider } from "@/utils/convex/ConvexClientProvider";
import { getToken } from "@/lib/auth-server";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "vet0",
  description: "Simple, real-time map veto for VALORANT",
  icons: {
    icon: [
      { url: "/favicon32.png", sizes: "32x32" },
      { url: "/favicon64.png", sizes: "64x64" },
    ],
  },
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
          <TooltipProvider>{children}</TooltipProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
