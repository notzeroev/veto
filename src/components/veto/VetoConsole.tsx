"use client";

import { useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import type { SanitizedVeto } from "./VetoDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowCounterClockwise, Check, Copy } from "@phosphor-icons/react";

type VetoAction = Doc<"vetos">["actions"][number];

type Props = {
  veto: Doc<"vetos"> | SanitizedVeto;
  className?: string;
  isAdmin?: boolean;
  onReset?: () => void;
};

export function VetoConsole({ veto, className = "", isAdmin = false, onReset }: Props) {
  const [copied, setCopied] = useState(false);
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

  const getActionLabel = (action: VetoAction | SanitizedVeto["actions"][number]) => {
    return action.type === "side_select" ? "SELECT" : action.type.toUpperCase();
  };

  const getActionArgument = (action: VetoAction | SanitizedVeto["actions"][number]) => {
    if (action.type !== "side_select") return action.map;
    return action.side === "attack" ? "Attack" : "Defense";
  };

  const getClipboardText = () => {
    return veto.actions.map((action) => {
      const teamDisplay = action.team === "none" ? "" : getTeamTag(action.team);
      return [teamDisplay, getActionLabel(action), getActionArgument(action)]
        .filter(Boolean)
        .join(" ");
    }).join("\n");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getClipboardText());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={cn("bg-card/50", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Console
          </CardTitle>
          <div className="flex items-center gap-2">
            {veto.status === "completed" && (
              <Button
                variant="neutral"
                size="sm"
                onClick={handleCopy}
                disabled={veto.actions.length === 0}
              >
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
            {isAdmin && onReset && veto.status !== "waiting" && (
              <Button variant="destructive" size="sm" onClick={onReset}>
                <ArrowCounterClockwise className="size-4" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="font-mono text-sm">
        {veto.actions.length === 0 ? (
          <div className="text-muted-foreground/50 text-xs">Waiting for veto to start...</div>
        ) : (
          <div className="space-y-1">
            {veto.actions.map((action, idx) => {
              const hasTimestamp = "timestamp" in action;
              const argument = getActionArgument(action);
              const teamDisplay = action.team === "none" ? "" : getTeamTag(action.team);

              return (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  {hasTimestamp && (
                    <span className="text-muted-foreground/60 w-20">
                      {formatTime(action.timestamp)}
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
                      {getActionLabel(action)}
                    </span>
                    <span className="text-foreground">{argument}</span>
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
