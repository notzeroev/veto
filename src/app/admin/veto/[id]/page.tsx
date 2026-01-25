"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { VetoDisplay } from "@/components/veto/VetoDisplay";
import { VetoConsole } from "@/components/veto/VetoConsole";
import { VetoHeader } from "@/components/veto/VetoHeader";
import { VetoBanner } from "@/components/veto/VetoBanner";
import { Container } from "@/components/layout/Container";
import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link, Check } from "@phosphor-icons/react";

function VetoAdminContent({ vetoId }: { vetoId: Id<"vetos"> }) {
  const veto = useQuery(api.vetos.getAsAdmin, { vetoId });
  const startVeto = useMutation(api.vetos.startVeto);
  const resetVeto = useMutation(api.vetos.resetVeto);
  const deleteVeto = useMutation(api.vetos.deleteVeto);

  const [copiedTeam, setCopiedTeam] = useState<"teamA" | "teamB" | null>(null);
  const [copiedToken, setCopiedToken] = useState<"teamA" | "teamB" | null>(null);

  if (veto === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (veto === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">Veto not found</div>
      </div>
    );
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const teamALink = `${baseUrl}/rep/${veto.teamA.token}`;
  const teamBLink = `${baseUrl}/rep/${veto.teamB.token}`;

  const copyLink = async (team: "teamA" | "teamB") => {
    const link = team === "teamA" ? teamALink : teamBLink;
    await navigator.clipboard.writeText(link);
    setCopiedTeam(team);
    setTimeout(() => setCopiedTeam(null), 2000);
  };

  const copyToken = async (team: "teamA" | "teamB") => {
    const token = team === "teamA" ? veto.teamA.token : veto.teamB.token;
    await navigator.clipboard.writeText(token);
    setCopiedToken(team);
    setTimeout(() => setCopiedToken(null), 2000);
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
    <Container className="py-6">
      <VetoHeader
          name={veto.name}
          teamAName={veto.teamA.name}
          teamBName={veto.teamB.name}
          format={veto.format}
        />

        {/* Two column layout: Left (links + console) | Right (veto display) - 1:2 ratio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Links + Console */}
          <div className="space-y-6">
            {/* Captain Links */}
            <Card>
              <CardContent className="space-y-3">
                {/* Team A */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-16 text-sm font-medium",
                      veto.teamAConnected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {veto.teamA.tag}
                  </span>
                  <code
                    onClick={() => copyToken("teamA")}
                    className="flex-1 min-w-0 text-sm text-muted-foreground font-mono bg-muted px-3 py-2 truncate cursor-pointer hover:bg-muted/80"
                  >
                    {copiedToken === "teamA" ? "Copied!" : veto.teamA.token}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyLink("teamA")}
                  >
                    {copiedTeam === "teamA" ? <Check size={16} /> : <Link size={16} />}
                  </Button>
                </div>

                {/* Team B */}
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-16 text-sm font-medium",
                      veto.teamBConnected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {veto.teamB.tag}
                  </span>
                  <code
                    onClick={() => copyToken("teamB")}
                    className="flex-1 min-w-0 text-sm text-muted-foreground font-mono bg-muted px-3 py-2 truncate cursor-pointer hover:bg-muted/80"
                  >
                    {copiedToken === "teamB" ? "Copied!" : veto.teamB.token}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyLink("teamB")}
                  >
                    {copiedTeam === "teamB" ? <Check size={16} /> : <Link size={16} />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Console */}
            <VetoConsole veto={veto} onReset={handleReset} onDelete={handleDelete} />
          </div>

          {/* Right Column: Banner + Veto Display */}
          <div>
            <VetoBanner veto={veto} userTeam="admin" onStartVeto={handleStart} />
            <VetoDisplay veto={veto} userTeam="admin" />
          </div>
        </div>
    </Container>
  );
}

export default function VetoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return <VetoAdminContent vetoId={id as Id<"vetos">} />;
}
