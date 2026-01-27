"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowCounterClockwise } from "@phosphor-icons/react";

// Type for action with timestamp
type VetoActionFull = {
  type: "ban" | "pick" | "decider" | "side_select";
  map: string;
  team: "teamA" | "teamB" | "none";
  side?: "attack" | "defense";
  timestamp: number;
};

type Props = {
  veto: Doc<"vetos">;
  className?: string;
  onReset?: () => void;
};

export function VetoConsole({ veto, className = "", onReset }: Props) {
  const teamATag = veto.teamA.tag;
  const teamBTag = veto.teamB.tag;

  const getTeamTag = (team: "teamA" | "teamB" | "none") => {
    if (team === "teamA") return teamATag;
    if (team === "teamB") return teamBTag;
    return "";
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className={cn("bg-card/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Console
          </CardTitle>
          {onReset && veto.status !== "waiting" && (
            <Button variant="destructive" size="sm" onClick={onReset}>
              <ArrowCounterClockwise className="size-4" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="font-mono text-sm">
        {veto.actions.length === 0 ? (
          <div className="text-muted-foreground/50 text-xs">Waiting for veto to start...</div>
        ) : (
          <div className="space-y-1">
            {veto.actions.map((action, idx) => {
              const hasTimestamp = "timestamp" in action;
              // Determine the argument based on action type (capitalize Attack/Defense)
              const argument =
                action.type === "side_select"
                  ? action.side === "attack"
                    ? "Attack"
                    : "Defense"
                  : action.map;
              // Get team display tag (or empty for decider)
              const teamDisplay =
                action.team === "none" ? "" : getTeamTag(action.team);

              return (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {hasTimestamp && (
                    <span className="text-muted-foreground/60 w-20">
                      {formatTime((action as VetoActionFull).timestamp)}
                    </span>
                  )}
                  <span className="flex items-center gap-3">
                    {teamDisplay && (
                      <span className="text-muted-foreground">{teamDisplay}</span>
                    )}
                    <span
                      className={cn(
                        action.type === "ban" && "text-destructive",
                        action.type === "decider" && "text-neutral",
                        action.type === "side_select" && "text-neutral",
                        action.type === "pick" && "text-constructive"
                      )}
                    >
                      {action.type === "side_select"
                        ? "SELECT"
                        : action.type.toUpperCase()}
                    </span>
                    <span
                      className="text-foreground"
                    >
                      {argument}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
