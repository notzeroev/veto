"use client";

import { useEffect, useRef, useState } from "react";
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
  teamA: { name: string; tag: string };
  teamB: { name: string; tag: string };
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

const HOLD_DURATION_MS = 800;

export function VetoDisplay({
  veto,
  userTeam,
  onMapClick,
}: Props) {
  const [holdingMap, setHoldingMap] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [submittingMap, setSubmittingMap] = useState<string | null>(null);
  const holdStartedAtRef = useRef<number | null>(null);
  const holdFrameRef = useRef<number | null>(null);
  const completedHoldRef = useRef(false);

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

  // Get team tags for display
  const teamATag = veto.teamA.tag;
  const teamBTag = veto.teamB.tag;

  const getTeamTag = (team: "teamA" | "teamB" | "none") => {
    if (team === "teamA") return teamATag;
    if (team === "teamB") return teamBTag;
    return "DEC";
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

  const isActionablePhase =
    veto.currentPhase === "ban" || veto.currentPhase === "pick";

  const cancelHold = () => {
    if (holdFrameRef.current !== null) {
      cancelAnimationFrame(holdFrameRef.current);
      holdFrameRef.current = null;
    }

    holdStartedAtRef.current = null;
    completedHoldRef.current = false;
    setHoldingMap(null);
    setHoldProgress(0);
  };

  useEffect(() => {
    return () => cancelHold();
  }, []);

  useEffect(() => {
    if (submittingMap && usedMaps.includes(submittingMap)) {
      setSubmittingMap(null);
      cancelHold();
    }
  }, [submittingMap, usedMaps]);

  useEffect(() => {
    if (!canAct || !isActionablePhase) {
      cancelHold();
      setSubmittingMap(null);
    }
  }, [canAct, isActionablePhase]);

  const startHold = (map: string) => {
    if (submittingMap || holdingMap === map) {
      return;
    }

    cancelHold();
    setHoldingMap(map);
    setHoldProgress(0);
    holdStartedAtRef.current = performance.now();
    completedHoldRef.current = false;

    const tick = (now: number) => {
      if (holdStartedAtRef.current === null) {
        return;
      }

      const elapsed = now - holdStartedAtRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION_MS, 1);

      setHoldProgress(progress);

      if (progress >= 1) {
        completedHoldRef.current = true;
        holdFrameRef.current = null;
        setSubmittingMap(map);
        Promise.resolve(onMapClick?.(map)).catch(() => {
          setSubmittingMap(null);
          cancelHold();
        });
        return;
      }

      holdFrameRef.current = requestAnimationFrame(tick);
    };

    holdFrameRef.current = requestAnimationFrame(tick);
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
          isActionablePhase &&
          !submittingMap;
        const isHolding = holdingMap === map;
        const holdOverlayTone =
          veto.currentPhase === "ban" ? "bg-destructive/20" : "bg-constructive/20";
        const holdOverlayProgress = isHolding ? holdProgress : submittingMap === map ? 1 : 0;
        const holdOverlayTranslate = -100 + holdOverlayProgress * 100;

        return (
          <button
            key={map}
            type="button"
            onPointerDown={() => canClick && startHold(map)}
            onPointerUp={() => {
              if (!completedHoldRef.current) {
                cancelHold();
              }
            }}
            onPointerLeave={() => {
              if (isHolding) {
                cancelHold();
              }
            }}
            onPointerCancel={cancelHold}
            disabled={!canClick}
            className={cn(
              "group relative flex h-25 select-none flex-col justify-between overflow-hidden border p-4 text-left transition-all touch-none",
              isBanned && "bg-destructive/20 border-destructive",
              isPicked && "bg-constructive/20 border-constructive",
              isDecider && "bg-neutral/20 border-neutral",
              !isBanned && !isPicked && !isDecider && isAvailable && canClick &&
                "bg-muted/50 border-border hover:bg-muted hover:border-muted-foreground/30 cursor-pointer",
              !isBanned && !isPicked && !isDecider && (!isAvailable || !canClick) &&
                "bg-card border-border",
              isHolding && "scale-[0.99]",
              !canClick && "cursor-default"
            )}
          >
            {/* Hold progress fill */}
            {!action && (canClick || submittingMap === map) && (
              <div
                className={cn(
                  "pointer-events-none absolute inset-y-0 left-0 w-[130%] transition-[transform,opacity] duration-75 ease-out",
                  holdOverlayTone
                )}
                style={{
                  opacity: holdOverlayProgress > 0 ? 1 : 0,
                  transform: `translateX(${holdOverlayTranslate}%)`,
                  maskImage: "linear-gradient(to right, black 0%, black 78%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, black 0%, black 78%, transparent 100%)",
                }}
              />
            )}

            {/* Background image layer */}
            <div
              className={cn(
                "absolute top-0 bottom-0 right-0 w-6/7 bg-cover bg-center opacity-40 pointer-events-none transition-all duration-300",
                canClick && "group-hover:opacity-80 group-hover:scale-110"
              )}
              style={{
                backgroundImage: `url(/maps/${map.toLowerCase()}.webp)`,
                maskImage: "linear-gradient(to right, transparent, black)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black)",
              }}
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
                    isDecider && "bg-neutral/20 text-neutral border-neutral/30"
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
                {sideSelection?.side ? `${getTeamTag(sideSelection.team)} ${sideSelection.side.charAt(0).toUpperCase() + sideSelection.side.slice(1)}` : "\u00A0"}
              </div>
              <div>
                {action && action.team !== "none" ? getTeamTag(action.team) : "\u00A0"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
