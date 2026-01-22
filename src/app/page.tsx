"use client";

import Link from "next/link";
import { useConvexAuth } from "convex/react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">vet0</h1>
        <p className="text-xl text-zinc-400 mb-8">
          Simple, real-time map veto for competitive matches.
          <br />
          No sign-up required for players.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLoading ? (
            <div className="text-zinc-400">Loading...</div>
          ) : isAuthenticated ? (
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/admin"
              className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="font-semibold mb-2">Real-time</h3>
            <p className="text-sm text-zinc-400">
              Instant updates for all participants. No refresh needed.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Simple</h3>
            <p className="text-sm text-zinc-400">
              Captains just click a link. No accounts, no downloads.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Flexible</h3>
            <p className="text-sm text-zinc-400">
              BO1, BO3, or BO5. Customize your map pool.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
