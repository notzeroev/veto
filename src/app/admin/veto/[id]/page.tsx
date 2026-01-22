"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { VetoDisplay } from "@/components/veto/VetoDisplay";
import Link from "next/link";
import { useState, use } from "react";

function VetoAdminContent({ vetoId }: { vetoId: Id<"vetos"> }) {
  const veto = useQuery(api.vetos.getAsAdmin, { vetoId });
  const startVeto = useMutation(api.vetos.startVeto);
  const resetVeto = useMutation(api.vetos.resetVeto);
  const deleteVeto = useMutation(api.vetos.deleteVeto);

  const [copiedTeam, setCopiedTeam] = useState<"teamA" | "teamB" | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (veto === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (veto === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-400">Veto not found</div>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const teamALink = `${baseUrl}/veto/${veto.teamA.token}`;
  const teamBLink = `${baseUrl}/veto/${veto.teamB.token}`;

  const copyLink = async (team: "teamA" | "teamB") => {
    const link = team === "teamA" ? teamALink : teamBLink;
    await navigator.clipboard.writeText(link);
    setCopiedTeam(team);
    setTimeout(() => setCopiedTeam(null), 2000);
  };

  const handleStart = async (firstPick: "teamA" | "teamB") => {
    await startVeto({ vetoId, firstPick });
  };

  const handleReset = async () => {
    await resetVeto({ vetoId });
  };

  const handleDelete = async () => {
    await deleteVeto({ vetoId });
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-zinc-400 hover:text-white transition-colors text-sm"
          >
            ← Back to dashboard
          </Link>
        </div>

        {/* Captain Links */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-zinc-400 mb-4">
            Share these links with team captains
          </h3>
          <div className="space-y-3">
            {/* Team A */}
            <div className="flex items-center gap-3">
              <span
                className={`w-32 text-sm ${
                  veto.teamAConnected ? "text-green-400" : "text-zinc-400"
                }`}
              >
                {veto.teamA.name} {veto.teamAConnected && "✓"}
              </span>
              <input
                readOnly
                value={teamALink}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
              />
              <button
                onClick={() => copyLink("teamA")}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors text-sm"
              >
                {copiedTeam === "teamA" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Team B */}
            <div className="flex items-center gap-3">
              <span
                className={`w-32 text-sm ${
                  veto.teamBConnected ? "text-green-400" : "text-zinc-400"
                }`}
              >
                {veto.teamB.name} {veto.teamBConnected && "✓"}
              </span>
              <input
                readOnly
                value={teamBLink}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-300"
              />
              <button
                onClick={() => copyLink("teamB")}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 transition-colors text-sm"
              >
                {copiedTeam === "teamB" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        {veto.status === "waiting" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">
              Start the veto - select who bans first
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => handleStart("teamA")}
                className="flex-1 py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                {veto.teamA.name} first
              </button>
              <button
                onClick={() => handleStart("teamB")}
                className="flex-1 py-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                {veto.teamB.name} first
              </button>
            </div>
          </div>
        )}

        {/* Veto Display */}
        <VetoDisplay veto={veto} userTeam="admin" showConsole={true} />

        {/* Admin Actions */}
        <div className="mt-8 flex gap-3 justify-end">
          {veto.status !== "waiting" && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
            >
              Reset Veto
            </button>
          )}
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-colors text-sm text-red-400"
            >
              Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Are you sure?</span>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors text-sm text-white"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VetoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <AuthGuard>
      <VetoAdminContent vetoId={id as Id<"vetos">} />
    </AuthGuard>
  );
}
