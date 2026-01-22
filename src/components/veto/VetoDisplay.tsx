"use client";

import { Doc } from "../../../convex/_generated/dataModel";

// Type for action (used in both admin and captain views)
type VetoActionBase = {
  type: "ban" | "pick" | "decider" | "side_select";
  map: string;
  team: "teamA" | "teamB" | "none";
  side?: "attack" | "defense";
};

// Full action with timestamp (admin view)
type VetoActionFull = VetoActionBase & {
  timestamp: number;
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

// Type for full veto (admin view - includes timestamps)
export type FullVeto = Omit<SanitizedVeto, "actions"> & {
  actions: VetoActionFull[];
};

type Props = {
  veto: SanitizedVeto | FullVeto | Doc<"vetos">;
  userTeam?: "teamA" | "teamB" | "admin" | "spectator";
  onMapClick?: (map: string) => void;
  onSideSelect?: (side: "attack" | "defense") => void;
  showConsole?: boolean; // Only show console for admin
};

export function VetoDisplay({
  veto,
  userTeam,
  onMapClick,
  onSideSelect,
  showConsole = false,
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

  // Format timestamp for console
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{veto.name}</h2>
        <div className="flex items-center justify-center gap-4 text-sm">
          <span
            className={veto.teamAConnected ? "text-green-400" : "text-zinc-500"}
          >
            {teamAName} {veto.teamAConnected ? "●" : "○"}
          </span>
          <span className="text-zinc-600">vs</span>
          <span
            className={veto.teamBConnected ? "text-green-400" : "text-zinc-500"}
          >
            {veto.teamBConnected ? "●" : "○"} {teamBName}
          </span>
        </div>
        <div className="mt-2 text-xs text-zinc-500 uppercase tracking-wide">
          {veto.format.toUpperCase()} • {veto.status.replace("_", " ")}
        </div>
      </div>

      {/* Current Turn Indicator */}
      {veto.status === "in_progress" && veto.currentTurn && veto.currentPhase && (
        <div
          className={`text-center py-3 px-4 rounded-lg ${
            isMyTurn
              ? "bg-green-500/20 border border-green-500/40"
              : "bg-zinc-800"
          }`}
        >
          <span className="font-medium">
            {veto.currentTurn === "teamA" ? teamAName : teamBName}
          </span>
          <span className="text-zinc-400 ml-2">
            {veto.currentPhase === "ban" && "must ban a map"}
            {veto.currentPhase === "pick" && "must pick a map"}
            {veto.currentPhase === "side_select" && "must select starting side"}
          </span>
          {isMyTurn && (
            <div className="text-green-400 text-sm mt-1">
              It&apos;s your turn!
            </div>
          )}
        </div>
      )}

      {/* Side Selection UI */}
      {veto.currentPhase === "side_select" && canAct && onSideSelect && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h3 className="text-center font-medium mb-4">
            Choose your starting side
            {veto.pendingSideSelectionMap && (
              <span className="text-zinc-400 ml-2">
                on {veto.pendingSideSelectionMap}
              </span>
            )}
          </h3>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onSideSelect("attack")}
              className="flex-1 max-w-[200px] py-4 bg-orange-500/20 border border-orange-500/40 rounded-lg hover:bg-orange-500/30 transition-colors"
            >
              <div className="font-semibold text-orange-400">Attack</div>
              <div className="text-xs text-zinc-400 mt-1">
                Start on attack side
              </div>
            </button>
            <button
              onClick={() => onSideSelect("defense")}
              className="flex-1 max-w-[200px] py-4 bg-blue-500/20 border border-blue-500/40 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <div className="font-semibold text-blue-400">Defense</div>
              <div className="text-xs text-zinc-400 mt-1">
                Start on defense side
              </div>
            </button>
          </div>
        </div>
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
              className={`
                relative p-4 rounded-lg border transition-all
                ${
                  isBanned
                    ? "bg-red-500/10 border-red-500/30 opacity-60"
                    : isPicked
                    ? "bg-green-500/10 border-green-500/30"
                    : isDecider
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : isAvailable && canClick
                    ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 cursor-pointer"
                    : "bg-zinc-900 border-zinc-800"
                }
                ${!canClick && "cursor-default"}
              `}
            >
              <div className="font-medium">{map}</div>

              {/* Status badge */}
              {(isBanned || isPicked || isDecider) && (
                <div
                  className={`
                  absolute top-2 right-2 text-xs px-2 py-0.5 rounded
                  ${isBanned ? "bg-red-500/20 text-red-400" : ""}
                  ${isPicked ? "bg-green-500/20 text-green-400" : ""}
                  ${isDecider ? "bg-yellow-500/20 text-yellow-400" : ""}
                `}
                >
                  {isBanned && "BANNED"}
                  {isPicked && "PICKED"}
                  {isDecider && "DECIDER"}
                </div>
              )}

              {/* Team indicator */}
              {action && action.team !== "none" && (
                <div className="text-xs text-zinc-500 mt-2">
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

      {/* Console - Admin only */}
      {showConsole && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-sm">
          <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">
            Console
          </h3>
          {veto.actions.length === 0 ? (
            <div className="text-zinc-600 text-xs">Waiting for veto to start...</div>
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
                      <span className="text-zinc-600 w-20">
                        {formatTime((action as VetoActionFull).timestamp)}
                      </span>
                    )}
                    <span className="text-zinc-300 flex items-center gap-2">
                      {teamDisplay && (
                        <span className="text-zinc-100">{teamDisplay}</span>
                      )}
                      <span
                        className={
                          action.type === "ban"
                            ? "text-red-400"
                            : action.type === "decider"
                            ? "text-yellow-400"
                            : action.type === "side_select"
                            ? "text-purple-400"
                            : "text-green-400"
                        }
                      >
                        {action.type === "side_select"
                          ? "SIDE SELECT"
                          : action.type.toUpperCase()}
                      </span>
                      <span className="text-zinc-300">
                        {argument}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completed Summary */}
      {veto.status === "completed" && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-green-400 font-semibold">Veto Complete!</div>
          <div className="text-sm text-zinc-400 mt-2">
            Maps to play: {pickedMaps.map((a) => a.map).join(", ")}
          </div>
        </div>
      )}

      {/* Waiting state */}
      {veto.status === "waiting" && (
        <div className="bg-zinc-800 rounded-lg p-4 text-center text-zinc-400">
          Waiting for admin to start the veto...
        </div>
      )}
    </div>
  );
}
