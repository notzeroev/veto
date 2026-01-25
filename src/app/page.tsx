"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <>
      <PublicHeader />
      <main className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">vet0</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Simple, real-time map veto for competitive matches.
            <br />
            No sign-up required for players.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : isAuthenticated ? (
              <Button
                nativeButton={false}
                render={<Link href="/admin">Go to Dashboard</Link>}
                size="lg"
                className="px-8 h-12"
              />
            ) : (
              <Button
                nativeButton={false}
                render={<Link href="/admin">Get Started</Link>}
                size="lg"
                className="px-8 h-12"
              />
            )}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Instant updates for all participants. No refresh needed.
                </p>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Simple</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Captains just click a link. No accounts, no downloads.
                </p>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Flexible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  BO1, BO3, or BO5. Customize your map pool.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
