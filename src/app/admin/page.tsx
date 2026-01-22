"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { UserMenu } from "@/components/auth/UserMenu";
import Link from "next/link";

function DashboardContent() {
  const vetos = useQuery(api.vetos.listMyVetos);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Vetos</h1>
          <div className="flex items-center gap-6">
            <UserMenu />
            <Link
              href="/admin/create"
              className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              New Veto
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {vetos === undefined && (
          <div className="text-center text-zinc-400 py-12">Loading...</div>
        )}

        {/* Empty state */}
        {vetos?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-zinc-400 mb-4">No vetos yet</div>
            <Link
              href="/admin/create"
              className="inline-block px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Create your first veto
            </Link>
          </div>
        )}

        {/* Veto list */}
        {vetos && vetos.length > 0 && (
          <div className="space-y-3">
            {vetos.map((veto) => (
              <Link
                key={veto._id}
                href={`/admin/veto/${veto._id}`}
                className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{veto.name}</div>
                    <div className="text-sm text-zinc-400 mt-1">
                      {veto.teamA.name} vs {veto.teamB.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500 uppercase">
                      {veto.format}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        veto.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : veto.status === "in_progress"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {veto.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
