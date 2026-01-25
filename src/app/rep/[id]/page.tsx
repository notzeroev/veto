"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { VetoDisplay } from "@/components/veto/VetoDisplay";
import { VetoHeader } from "@/components/veto/VetoHeader";
import { CaptainHeader } from "@/components/layout/CaptainHeader";
import { Header } from "@/components/layout/Header";
import { useEffect, use } from "react";

export default function CaptainVetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: token } = use(params);

  const data = useQuery(api.vetos.getByToken, { token });
  const captainConnect = useMutation(api.vetos.captainConnect);
  const banMap = useMutation(api.vetos.banMap);
  const pickMap = useMutation(api.vetos.pickMap);
  const selectSide = useMutation(api.vetos.selectSide);

  // Mark captain as connected on mount
  useEffect(() => {
    if (data) {
      captainConnect({ token }).catch(console.error);
    }
  }, [data, captainConnect, token]);

  // Loading state
  if (data === undefined) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </>
    );
  }

  // Invalid token
  if (data === null) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-destructive text-xl mb-2">Invalid Link</div>
            <div className="text-muted-foreground">
              This veto link is invalid or has expired.
            </div>
          </div>
        </div>
      </>
    );
  }

  const { veto, team } = data;

  const handleMapClick = async (map: string) => {
    try {
      if (veto.currentPhase === "ban") {
        await banMap({ token, map });
      } else if (veto.currentPhase === "pick") {
        await pickMap({ token, map });
      }
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  const handleSideSelect = async (side: "attack" | "defense") => {
    try {
      await selectSide({ token, side });
    } catch (err) {
      console.error("Side selection failed:", err);
    }
  };

  // Get the user's team name
  const myTeamName = team === "teamA" ? veto.teamA.name : veto.teamB.name;

  return (
    <>
      <CaptainHeader teamName={myTeamName} />
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          <VetoHeader
            name={veto.name}
            teamAName={veto.teamA.name}
            teamBName={veto.teamB.name}
            format={veto.format}
          />
          <VetoDisplay
            veto={veto}
            userTeam={team}
            onMapClick={handleMapClick}
            onSideSelect={handleSideSelect}
          />
        </div>
      </main>
    </>
  );
}
