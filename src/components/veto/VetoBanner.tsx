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

  // Get picked maps with side selection info for completed summary
  const pickedMapsWithSides = veto.actions
    .filter((a) => a.type === "pick" || a.type === "decider")
    .map((a) => {
      const sideSelect = veto.actions.find(
        (s) => s.type === "side_select" && s.map === a.map
      );
      return {
        map: a.map,
        sideTeam: sideSelect?.team,
        side: sideSelect?.side,
      };
    });

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
        <div
          className="w-full overflow-x-auto scrollbar-none"
        >
          <div className="flex items-center gap-3 px-4 w-max mx-auto">
            {pickedMapsWithSides.map((entry, i) => {
              const sideTag =
                entry.sideTeam === "teamA"
                  ? teamATag
                  : entry.sideTeam === "teamB"
                    ? teamBTag
                    : null;
              return (
                <span key={entry.map} className="flex items-center gap-3">
                  {i > 0 && (
                    <span className="text-muted-foreground/40 text-lg">›</span>
                  )}
                  <span className="flex flex-col items-center">
                    <span className="font-medium">{entry.map}</span>
                    {entry.side && sideTag && (
                      <span className="text-xs text-muted-foreground leading-tight">
                        {sideTag} {entry.side === "attack" ? "ATK" : "DEF"}
                      </span>
                    )}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Side Selection - Active (your turn) */}
      {state === "side_select_active" && onSideSelect && (
        <>
          <div className="font-medium mb-3">
            Select a side
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
            >
              Attack
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSideSelect("defense")}
            >
              Defense
            </Button>
          </div>
        </>
      )}

      {/* Side Selection - Waiting */}
      {state === "side_select_waiting" && (
        <div className="text-muted-foreground">
          {currentTeamTag} is selecting a side
          {veto.pendingSideSelectionMap && ` on ${veto.pendingSideSelectionMap}`}...
        </div>
      )}

      {/* Ban/Pick - Active (your turn) */}
      {state === "turn_active" && (
        <>
          <div className="text-primary font-semibold">It's your turn.</div>
          <div className="text-sm text-muted-foreground mt-1">
            {veto.currentPhase === "ban" && "Ban a map"}
            {veto.currentPhase === "pick" && "Pick a map"}
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
