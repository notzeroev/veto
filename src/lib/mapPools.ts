export type Game = "valorant";

export type MapPool = {
  game: Game;
  maps: string[];
  active: string[];
};

export const VALORANT_MAP_POOL: MapPool = {
  game: "valorant",
  maps: [
    "Haven",
    "Bind",
    "Split",
    "Ascent",
    "Icebox",
    "Breeze",
    "Fracture",
    "Pearl",
    "Lotus",
    "Sunset",
    "Abyss",
    "Corrode",
  ],
  active: ["Haven", "Bind", "Split", "Breeze", "Pearl", "Abyss", "Corrode"],
};

export const MAP_POOLS: Record<Game, MapPool> = {
  valorant: VALORANT_MAP_POOL,
};
