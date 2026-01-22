"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  onSideSelect?: (side: "attack" | "defense") => void;
};

export function VetoDisplay({
  veto,
  userTeam,
  onMapClick,
  onSideSelect,
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

  // Get picked maps for summary (picks and decider with their side selections)
  const pickedMaps = veto.actions.filter(
    (a) => a.type === "pick" || a.type === "decider"
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{veto.name}</h2>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span
            className={veto.teamAConnected ? "text-primary" : "text-muted-foreground"}
          >
            {teamAName} {veto.teamAConnected ? "●" : "○"}
          </span>
          <span className="text-muted-foreground/50">vs</span>
          <span
            className={veto.teamBConnected ? "text-primary" : "text-muted-foreground"}
          >
            {veto.teamBConnected ? "●" : "○"} {teamBName}
          </span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground uppercase tracking-wide">
          {veto.format.toUpperCase()} • {veto.status.replace("_", " ")}
        </div>
      </div>

      {/* Current Turn Indicator */}
      {veto.status === "in_progress" && veto.currentTurn && veto.currentPhase && (
        <div
          className={cn(
            "text-center py-3 px-4 border",
            isMyTurn
              ? "bg-primary/10 border-primary/40"
              : "bg-muted/50 border-border"
          )}
        >
          <span className="font-medium">
            {veto.currentTurn === "teamA" ? teamAName : teamBName}
          </span>
          <span className="text-muted-foreground ml-2">
            {veto.currentPhase === "ban" && "must ban a map"}
            {veto.currentPhase === "pick" && "must pick a map"}
            {veto.currentPhase === "side_select" && "must select starting side"}
          </span>
          {isMyTurn && (
            <div className="text-primary text-sm mt-1">
              It&apos;s your turn!
            </div>
          )}
        </div>
      )}

      {/* Side Selection UI */}
      {veto.currentPhase === "side_select" && canAct && onSideSelect && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-center font-medium mb-4">
              Choose your starting side
              {veto.pendingSideSelectionMap && (
                <span className="text-muted-foreground ml-2">
                  on {veto.pendingSideSelectionMap}
                </span>
              )}
            </h3>
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => onSideSelect("attack")}
                className="flex-1 max-w-[200px] h-auto py-4 flex-col bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/20 text-orange-400"
              >
                <div className="font-semibold">Attack</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Start on attack side
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => onSideSelect("defense")}
                className="flex-1 max-w-[200px] h-auto py-4 flex-col bg-blue-500/10 border-blue-500/40 hover:bg-blue-500/20 text-blue-400"
              >
                <div className="font-semibold">Defense</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Start on defense side
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                "relative p-4 border transition-all text-left",
                isBanned && "bg-destructive/10 border-destructive/30 opacity-60",
                isPicked && "bg-primary/10 border-primary/30",
                isDecider && "bg-yellow-500/10 border-yellow-500/30",
                !isBanned && !isPicked && !isDecider && isAvailable && canClick &&
                  "bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30 cursor-pointer",
                !isBanned && !isPicked && !isDecider && (!isAvailable || !canClick) &&
                  "bg-card border-border",
                !canClick && "cursor-default"
              )}
            >
              <div className="font-medium">{map}</div>

              {/* Status badge */}
              {(isBanned || isPicked || isDecider) && (
                <Badge
                  variant="outline"
                  className={cn(
                    "absolute top-2 right-2",
                    isBanned && "bg-destructive/20 text-destructive border-destructive/30",
                    isPicked && "bg-primary/20 text-primary border-primary/30",
                    isDecider && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  )}
                >
                  {isBanned && "BANNED"}
                  {isPicked && "PICKED"}
                  {isDecider && "DECIDER"}
                </Badge>
              )}

              {/* Team indicator */}
              {action && action.team !== "none" && (
                <div className="text-xs text-muted-foreground mt-2">
                  {getTeamName(action.team)}
                </div>
              )}

              {/* Side selection indicator */}
              {sideSelection && (
                <div className="text-xs mt-1">
                  {getTeamName(sideSelection.team)}: {sideSelection.side}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Completed Summary */}
      {veto.status === "completed" && (
        <div className="bg-primary/10 border border-primary/30 p-4 text-center">
          <div className="text-primary font-semibold">Veto Complete!</div>
          <div className="text-sm text-muted-foreground mt-2">
            Maps to play: {pickedMaps.map((a) => a.map).join(", ")}
          </div>
        </div>
      )}

      {/* Waiting state */}
      {veto.status === "waiting" && (
        <div className="bg-muted p-4 text-center text-muted-foreground">
          Waiting for admin to start the veto...
        </div>
      )}
    </div>
  );
}
