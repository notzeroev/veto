"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { Container } from "@/components/layout/Container";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <>
      <PublicHeader />
      <Container className="py-6 min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-10">Simple, real-time map veto for VALORANT</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="border border-destructive/40 bg-destructive/5 p-4 text-left">
              <h3 className="font-semibold text-destructive mb-1">Real-time</h3>
              <p className="text-xs text-muted-foreground">
                Instant updates. No refreshes.
              </p>
            </div>
            <div className="border border-constructive/40 bg-constructive/5 p-4 text-left">
              <h3 className="font-semibold text-constructive mb-1">Simple</h3>
              <p className="text-xs text-muted-foreground">
                Share links. No accounts.
              </p>
            </div>
            <div className="border border-neutral/40 bg-neutral/5 p-4 text-left">
              <h3 className="font-semibold text-neutral mb-1">Flexible</h3>
              <p className="text-xs text-muted-foreground">
                Custom map pools. BO-X.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="text-lg p-6"
            nativeButton={false}
            render={
              <Link href="/admin/create">
                Get started
              </Link>
            }
          />
        </div>
      </Container>
    </>
  );
}
