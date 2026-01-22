"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEFAULT_MAPS = [
  "Ascent",
  "Haven",
  "Icebox",
  "Split",
  "Sunset",
  "Lotus",
  "Pearl",
  "Bind",
  "Breeze",
  "Fracture",
  "Abyss",
];

export function CreateVetoForm() {
  const router = useRouter();
  const createVeto = useMutation(api.vetos.create);

  const [name, setName] = useState("");
  const [format, setFormat] = useState<"bo1" | "bo3" | "bo5">("bo3");
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [selectedMaps, setSelectedMaps] = useState<string[]>(DEFAULT_MAPS.slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMap = (map: string) => {
    setSelectedMaps((prev) =>
      prev.includes(map) ? prev.filter((m) => m !== map) : [...prev, map]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedMaps.length < 7) {
      setError("Please select at least 7 maps");
      return;
    }

    setLoading(true);
    try {
      const vetoId = await createVeto({
        name,
        format,
        teamAName,
        teamBName,
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
        <Label>Format</Label>
        <div className="flex gap-3">
          {(["bo1", "bo3", "bo5"] as const).map((f) => (
            <Button
              key={f}
              type="button"
              variant={format === f ? "default" : "outline"}
              onClick={() => setFormat(f)}
              className="flex-1"
            >
              {f.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Team A</Label>
          <Input
            type="text"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            required
            placeholder="Team name"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label>Team B</Label>
          <Input
            type="text"
            value={teamBName}
            onChange={(e) => setTeamBName(e.target.value)}
            required
            placeholder="Team name"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>
          Map Pool ({selectedMaps.length} selected, minimum 7)
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {DEFAULT_MAPS.map((map) => (
            <Button
              key={map}
              type="button"
              variant="outline"
              onClick={() => toggleMap(map)}
              className={cn(
                "text-sm",
                selectedMaps.includes(map) &&
                  "bg-primary/10 border-primary/40 text-primary hover:bg-primary/20"
              )}
            >
              {map}
            </Button>
          ))}
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
        className="w-full h-10"
      >
        {loading ? "Creating..." : "Create Veto"}
      </Button>
    </form>
  );
}
