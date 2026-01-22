"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { VetoDisplay } from "@/components/veto/VetoDisplay";
import { VetoConsole } from "@/components/veto/VetoConsole";
import Link from "next/link";
import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (veto === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Veto not found</div>
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
      <div className="max-w-6xl mx-auto">
        {/* Top row: Share Links + Console side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Captain Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Share these links with team captains
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Team A */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-32 text-sm truncate",
                    veto.teamAConnected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {veto.teamA.name} {veto.teamAConnected && "✓"}
                </span>
                <Input
                  readOnly
                  value={teamALink}
                  className="flex-1 min-w-0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink("teamA")}
                >
                  {copiedTeam === "teamA" ? "Copied!" : "Copy"}
                </Button>
              </div>

              {/* Team B */}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "w-32 text-sm truncate",
                    veto.teamBConnected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {veto.teamB.name} {veto.teamBConnected && "✓"}
                </span>
                <Input
                  readOnly
                  value={teamBLink}
                  className="flex-1 min-w-0"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink("teamB")}
                >
                  {copiedTeam === "teamB" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Console */}
          <VetoConsole veto={veto} className="h-full" />
        </div>

        {/* Admin Controls */}
        {veto.status === "waiting" && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Start the veto - select who bans first
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleStart("teamA")}
                  className="flex-1"
                >
                  {veto.teamA.name} first
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStart("teamB")}
                  className="flex-1"
                >
                  {veto.teamB.name} first
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Veto Display */}
        <VetoDisplay veto={veto} userTeam="admin" />

        {/* Admin Actions */}
        <div className="mt-8 flex gap-3 justify-end">
          {veto.status !== "waiting" && (
            <Button variant="outline" onClick={handleReset}>
              Reset Veto
            </Button>
          )}
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Are you sure?</span>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Yes, delete
              </Button>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
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
