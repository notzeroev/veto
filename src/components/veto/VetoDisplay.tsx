"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Type for action (used in both admin and captain views)
type VetoActionBase = {
  type: "ban" | "pick" | "decider" | "side_select";
  map: string;
  team: "teamA" | "teamB" | "none";
  side?: "attack" | "defense";
};

// Type for sanitized veto (captain/spectator view - no timestamps)
export type SanitizedVeto = {
  _id: Doc<"vetos">["_id"];
  name: string;
  format: "bo1" | "bo3" | "bo5";
  mapPool: string[];
  teamA: { name: string };
  teamB: { name: string };
  status: "waiting" | "coin_flip" | "in_progress" | "completed";
  firstPick?: "teamA" | "teamB";
  currentTurn?: "teamA" | "teamB";
  currentPhase?: "ban" | "pick" | "side_select";
  actions: VetoActionBase[];
  pendingSideSelectionMap?: string;
  teamAConnected: boolean;
  teamBConnected: boolean;
};

type Props = {
  veto: SanitizedVeto | Doc<"vetos">;
  userTeam?: "teamA" | "teamB" | "admin" | "spectator";
  onMapClick?: (map: string) => void;
};

export function VetoDisplay({
  veto,
  userTeam,
  onMapClick,
}: Props) {
  // Get used maps (ban, pick, decider - not side_select)
  const usedMaps = veto.actions
    .filter((a) => a.type === "ban" || a.type === "pick" || a.type === "decider")
    .map((a) => a.map);
  const availableMaps = veto.mapPool.filter((m) => !usedMaps.includes(m));

  const isMyTurn =
    userTeam !== "admin" &&
    userTeam !== "spectator" &&
    veto.currentTurn === userTeam;

  const canAct = veto.status === "in_progress" && isMyTurn;

  // Get team names
  const teamAName = veto.teamA.name;
  const teamBName = veto.teamB.name;

  const getTeamName = (team: "teamA" | "teamB" | "none") => {
    if (team === "teamA") return teamAName;
    if (team === "teamB") return teamBName;
    return "Decider";
  };

  // Get the side selection for a map
  const getSideSelection = (map: string) => {
    return veto.actions.find((a) => a.type === "side_select" && a.map === map);
  };

  // Get map status (for display)
  const getMapAction = (map: string) => {
    return veto.actions.find(
      (a) => (a.type === "ban" || a.type === "pick" || a.type === "decider") && a.map === map
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {veto.mapPool.map((map) => {
        const action = getMapAction(map);
        const sideSelection = getSideSelection(map);
        const isBanned = action?.type === "ban";
        const isPicked = action?.type === "pick";
        const isDecider = action?.type === "decider";
        const isAvailable = availableMaps.includes(map);

        const canClick =
          canAct &&
          isAvailable &&
          (veto.currentPhase === "ban" || veto.currentPhase === "pick");

        return (
          <button
            key={map}
            onClick={() => canClick && onMapClick?.(map)}
            disabled={!canClick}
            className={cn(
              "relative flex flex-col justify-between p-4 border transition-all text-left h-20 overflow-hidden",
              isBanned && "bg-destructive/20 border-destructive opacity-60",
              isPicked && "bg-constructive/20 border-constructive",
              isDecider && "bg-yellow-500/20 border-yellow-500",
              !isBanned && !isPicked && !isDecider && isAvailable && canClick &&
                "bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30 cursor-pointer",
              !isBanned && !isPicked && !isDecider && (!isAvailable || !canClick) &&
                "bg-card border-border",
              !canClick && "cursor-default"
            )}
          >
            {/* Background image layer */}
            <div
              className="absolute inset-0 bg-cover bg-top opacity-15 grayscale pointer-events-none"
              style={{ backgroundImage: `url(/maps/${map.toLowerCase()}.webp)` }}
            />

            {/* Row 1: map name + status badge */}
            <div className="relative flex justify-between items-center">
              <div className="font-medium">{map}</div>
              {(isBanned || isPicked || isDecider) && (
                <Badge
                  variant="outline"
                  className={cn(
                    isBanned && "bg-destructive/20 text-destructive border-destructive/30",
                    isPicked && "bg-constructive/20 text-constructive border-constructive/30",
                    isDecider && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  )}
                >
                  {isBanned && "BANNED"}
                  {isPicked && "PICKED"}
                  {isDecider && "DECIDER"}
                </Badge>
              )}
            </div>

            {/* Row 2: side selection + team that picked/banned */}
            <div className="relative flex justify-between items-center text-xs text-muted-foreground">
              <div>
                {sideSelection ? `${getTeamName(sideSelection.team)} ${sideSelection.side}` : "\u00A0"}
              </div>
              <div>
                {action && action.team !== "none" ? getTeamName(action.team) : "\u00A0"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
