"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@phosphor-icons/react";
import { MAP_POOLS, type Game } from "@/lib/mapPools";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CreateVetoForm() {
  const router = useRouter();
  const createVeto = useMutation(api.vetos.create);

  const [game, setGame] = useState<Game>("valorant");
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"bo1" | "bo3" | "bo5">("bo3");
  const [teamAName, setTeamAName] = useState("");
  const [teamATag, setTeamATag] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [teamBTag, setTeamBTag] = useState("");
  const [selectedMaps, setSelectedMaps] = useState<string[]>(
    MAP_POOLS[game].active,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapPool = MAP_POOLS[game];

  const toggleMap = (map: string) => {
    setSelectedMaps((prev) => {
      if (prev.includes(map)) {
        return prev.filter((m) => m !== map);
      }
      // Don't allow selecting more than 7 maps
      if (prev.length >= 7) {
        return prev;
      }
      return [...prev, map];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (teamAName.length < 5 || teamAName.length > 15) {
      setError("Team A name must be 5-15 characters");
      return;
    }
    if (teamBName.length < 5 || teamBName.length > 15) {
      setError("Team B name must be 5-15 characters");
      return;
    }
    if (teamATag.length < 1 || teamATag.length > 5) {
      setError("Team A tag must be 1-5 characters");
      return;
    }
    if (teamBTag.length < 1 || teamBTag.length > 5) {
      setError("Team B tag must be 1-5 characters");
      return;
    }
    if (selectedMaps.length !== 7) {
      setError("Please select exactly 7 maps");
      return;
    }

    setLoading(true);
    try {
      const vetoId = await createVeto({
        game,
        name,
        format,
        teamAName,
        teamATag,
        teamBName,
        teamBTag,
        mapPool: selectedMaps,
      });
      router.push(`/admin/veto/${vetoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create veto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label>Match Name</Label>
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Upper Finals"
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label>Game</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setGame("valorant")}
            className={cn(
              "flex-1",
              game === "valorant"
                ? "bg-neutral/20! border-neutral!"
                : "hover:bg-muted! dark:hover:bg-input/30! hover:border-neutral!",
            )}
          >
            VALORANT
          </Button>
          <Tooltip>
            <TooltipTrigger className="flex-1" render={<span />}>
              <Button
                type="button"
                variant="outline"
                disabled
                className="w-full opacity-50 cursor-not-allowed pointer-events-none"
              >
                CS2
              </Button>
            </TooltipTrigger>
            <TooltipContent>Coming soon :)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Format</Label>
        <div className="flex gap-3">
          {(["bo1", "bo3", "bo5"] as const).map((f) => (
            <Button
              key={f}
              type="button"
              variant="outline"
              onClick={() => setFormat(f)}
              className={cn(
                "flex-1",
                format === f
                  ? "bg-neutral/20! border-neutral!"
                  : "hover:bg-muted! dark:hover:bg-input/30! hover:border-neutral!",
              )}
            >
              {f.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Team A</Label>
          <Input
            type="text"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            required
            placeholder="Name (5-15)"
            className="h-10"
            minLength={5}
            maxLength={15}
          />
          <Input
            type="text"
            value={teamATag}
            onChange={(e) => setTeamATag(e.target.value.toUpperCase())}
            required
            placeholder="TAG (1-5)"
            className="h-10 uppercase mt-2"
            minLength={1}
            maxLength={5}
          />
        </div>
        <div>
          <Label className="mb-2 block">Team B</Label>
          <Input
            type="text"
            value={teamBName}
            onChange={(e) => setTeamBName(e.target.value)}
            required
            placeholder="Name (5-15)"
            className="h-10"
            minLength={5}
            maxLength={15}
          />
          <Input
            type="text"
            value={teamBTag}
            onChange={(e) => setTeamBTag(e.target.value.toUpperCase())}
            required
            placeholder="TAG (1-5)"
            className="h-10 uppercase mt-2"
            minLength={1}
            maxLength={5}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Map Pool ({selectedMaps.length}/7 selected)</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {mapPool.maps.map((map) => {
            const isSelected = selectedMaps.includes(map);

            return (
              <Button
                key={map}
                type="button"
                variant="outline"
                onClick={() => toggleMap(map)}
                className={cn(
                  "h-9 text-sm",
                  isSelected
                    ? "bg-neutral/20! border-neutral!"
                    : "hover:bg-muted! dark:hover:bg-input/30! hover:border-neutral!",
                )}
              >
                {map}
              </Button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm bg-destructive/10 px-4 py-2 border border-destructive/20">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        variant="constructive"
        className="w-full h-10"
      >
        <PlusIcon className="size-4" />
        {loading ? "Creating..." : "Create Veto"}
      </Button>
    </form>
  );
}
