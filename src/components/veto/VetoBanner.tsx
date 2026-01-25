"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SanitizedVeto } from "./VetoDisplay";

type Props = {
  veto: SanitizedVeto | Doc<"vetos">;
  userTeam: "teamA" | "teamB" | "admin" | "spectator";
  onStartVeto?: (firstPick: "teamA" | "teamB") => void;
  onSideSelect?: (side: "attack" | "defense") => void;
};

export function VetoBanner({
  veto,
  userTeam,
  onStartVeto,
  onSideSelect,
}: Props) {
  const teamATag = veto.teamA.tag;
  const teamBTag = veto.teamB.tag;

  const isMyTurn =
    userTeam !== "admin" &&
    userTeam !== "spectator" &&
    veto.currentTurn === userTeam;

  const currentTeamTag = veto.currentTurn === "teamA" ? teamATag : teamBTag;

  // Get picked maps for completed summary
  const pickedMaps = veto.actions
    .filter((a) => a.type === "pick" || a.type === "decider")
    .map((a) => a.map);

  // Determine banner state (priority order)
  const getState = () => {
    // 1. Completed
    if (veto.status === "completed") {
      return "completed";
    }

    // 2-3. Side selection
    if (veto.currentPhase === "side_select") {
      return isMyTurn ? "side_select_active" : "side_select_waiting";
    }

    // 4-5. Ban/Pick in progress
    if (veto.status === "in_progress" && veto.currentPhase) {
      return isMyTurn ? "turn_active" : "turn_waiting";
    }

    // 6-7. Waiting to start
    if (veto.status === "waiting") {
      return userTeam === "admin" ? "waiting_admin" : "waiting_player";
    }

    return "idle";
  };

  const state = getState();

  // Determine styling based on state
  const isHighlighted =
    state === "completed" ||
    state === "side_select_active" ||
    state === "turn_active" ||
    state === "waiting_admin";

  return (
    <div
      className={cn(
        "h-28 flex flex-col items-center justify-center border mb-6",
        isHighlighted
          ? "bg-primary/10 border-primary/40"
          : "bg-muted/50 border-border"
      )}
    >
      {/* Completed */}
      {state === "completed" && (
        <>
          <div className="text-primary font-semibold">Veto Complete</div>
          <div className="text-sm text-muted-foreground mt-1">
            Maps to play: {pickedMaps.join(", ")}
          </div>
        </>
      )}

      {/* Side Selection - Active (your turn) */}
      {state === "side_select_active" && onSideSelect && (
        <>
          <div className="font-medium mb-3">
            Choose your side
            {veto.pendingSideSelectionMap && (
              <span className="text-muted-foreground ml-2">
                on {veto.pendingSideSelectionMap}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSideSelect("attack")}
              className="bg-orange-500/10 border-orange-500/40 hover:bg-orange-500/20 text-orange-400"
            >
              Attack
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSideSelect("defense")}
              className="bg-blue-500/10 border-blue-500/40 hover:bg-blue-500/20 text-blue-400"
            >
              Defense
            </Button>
          </div>
        </>
      )}

      {/* Side Selection - Waiting */}
      {state === "side_select_waiting" && (
        <div className="text-muted-foreground">
          {currentTeamTag} is choosing their side
          {veto.pendingSideSelectionMap && ` on ${veto.pendingSideSelectionMap}`}...
        </div>
      )}

      {/* Ban/Pick - Active (your turn) */}
      {state === "turn_active" && (
        <>
          <div className="text-primary font-semibold">It&apos;s your turn!</div>
          <div className="text-sm text-muted-foreground mt-1">
            {veto.currentPhase === "ban" && "Select a map to ban"}
            {veto.currentPhase === "pick" && "Select a map to pick"}
          </div>
        </>
      )}

      {/* Ban/Pick - Waiting */}
      {state === "turn_waiting" && (
        <div className="text-muted-foreground">
          {currentTeamTag} is {veto.currentPhase === "ban" ? "banning" : "picking"} a map...
        </div>
      )}

      {/* Waiting - Admin */}
      {state === "waiting_admin" && onStartVeto && (
        <>
          <div className="font-medium mb-3">
            Start the veto — select who bans first
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartVeto("teamA")}
            >
              {teamATag}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStartVeto("teamB")}
            >
              {teamBTag}
            </Button>
          </div>
        </>
      )}

      {/* Waiting - Player/Spectator */}
      {state === "waiting_player" && (
        <div className="text-muted-foreground">
          Waiting for admin to start the veto...
        </div>
      )}
    </div>
  );
}
