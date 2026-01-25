"use client";

import { Doc } from "../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
};

export function VetoConsole({ veto, className = "" }: Props) {
  const teamAName = veto.teamA.name;
  const teamBName = veto.teamB.name;

  const getTeamName = (team: "teamA" | "teamB" | "none") => {
    if (team === "teamA") return teamAName;
    if (team === "teamB") return teamBName;
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
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Console
        </CardTitle>
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
              // Get team display name (or empty for decider)
              const teamDisplay =
                action.team === "none" ? "" : getTeamName(action.team);

              return (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {hasTimestamp && (
                    <span className="text-muted-foreground/60 w-20">
                      {formatTime((action as VetoActionFull).timestamp)}
                    </span>
                  )}
                  <span className="flex items-center gap-3">
                    {teamDisplay && (
                      <span className="text-foreground">{teamDisplay}</span>
                    )}
                    <span
                      className={cn(
                        action.type === "ban" && "text-destructive",
                        action.type === "decider" && "text-yellow-400",
                        action.type === "side_select" && "text-purple-400",
                        action.type === "pick" && "text-constructive"
                      )}
                    >
                      {action.type === "side_select"
                        ? "SIDE SELECT"
                        : action.type.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        action.type === "side_select"
                          ? action.side === "attack"
                            ? "text-orange-400"
                            : "text-blue-400"
                          : "text-muted-foreground"
                      )}
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
