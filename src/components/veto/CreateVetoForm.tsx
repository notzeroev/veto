"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div>
        <label className="block text-sm font-medium mb-2">Match Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g., Grand Finals - Team A vs Team B"
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Format</label>
        <div className="flex gap-3">
          {(["bo1", "bo3", "bo5"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                format === f
                  ? "bg-white text-black border-white"
                  : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Team A</label>
          <input
            type="text"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            required
            placeholder="Team name"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Team B</label>
          <input
            type="text"
            value={teamBName}
            onChange={(e) => setTeamBName(e.target.value)}
            required
            placeholder="Team name"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Map Pool ({selectedMaps.length} selected, minimum 7)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {DEFAULT_MAPS.map((map) => (
            <button
              key={map}
              type="button"
              onClick={() => toggleMap(map)}
              className={`py-2 px-3 rounded-lg border transition-colors text-sm ${
                selectedMaps.includes(map)
                  ? "bg-green-500/20 border-green-500/40 text-green-400"
                  : "bg-zinc-800 border-zinc-700 hover:border-zinc-600"
              }`}
            >
              {map}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Veto"}
      </button>
    </form>
  );
}
