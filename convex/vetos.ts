import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { authComponent } from "./auth";

// Helper to get the current authenticated user's ID
async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const user = await authComponent.getAuthUser(ctx);
  return user?._id ?? null;
}

// Type for veto actions (now with timestamp and side_select as separate type)
type VetoAction = {
  type: "ban" | "pick" | "decider" | "side_select";
  map: string;
  team: "teamA" | "teamB" | "none";
  side?: "attack" | "defense"; // For side_select actions
  timestamp: number;
};

// Generate a random token for captain invites
function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Default Valorant map pool
const DEFAULT_MAP_POOL = [
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

// Veto sequence definitions for each format
// teamOffset: 0 = first pick team, 1 = other team
// For decider: the team that DIDN'T do the last ban picks side
const VETO_SEQUENCES = {
  // BO1: Ban-Ban-Ban-Ban-Ban-Ban-Decider (7 maps)
  bo1: [
    { type: "ban" as const, teamOffset: 0 },
    { type: "ban" as const, teamOffset: 1 },
    { type: "ban" as const, teamOffset: 0 },
    { type: "ban" as const, teamOffset: 1 },
    { type: "ban" as const, teamOffset: 0 },
    { type: "ban" as const, teamOffset: 1 }, // Last ban by team offset 1
    { type: "decider" as const, teamOffset: 0 }, // Team offset 0 picks side (didn't ban last)
  ],
  // BO3: Ban-Ban-Pick-Pick-Ban-Ban-Decider (7 maps)
  bo3: [
    { type: "ban" as const, teamOffset: 0 },
    { type: "ban" as const, teamOffset: 1 },
    { type: "pick" as const, teamOffset: 0 },
    { type: "pick" as const, teamOffset: 1 },
    { type: "ban" as const, teamOffset: 0 },
    { type: "ban" as const, teamOffset: 1 }, // Last ban by team offset 1
    { type: "decider" as const, teamOffset: 0 }, // Team offset 0 picks side
  ],
  // BO5: Ban-Ban-Pick-Pick-Pick-Pick-Decider (7 maps)
  bo5: [
    { type: "ban" as const, teamOffset: 0 },
    { type: "ban" as const, teamOffset: 1 }, // Last ban by team offset 1
    { type: "pick" as const, teamOffset: 0 },
    { type: "pick" as const, teamOffset: 1 },
    { type: "pick" as const, teamOffset: 0 },
    { type: "pick" as const, teamOffset: 1 },
    { type: "decider" as const, teamOffset: 0 }, // Team offset 0 picks side
  ],
};

function getTeamFromOffset(
  firstPick: "teamA" | "teamB",
  offset: number
): "teamA" | "teamB" {
  const teams: ("teamA" | "teamB")[] =
    firstPick === "teamA" ? ["teamA", "teamB"] : ["teamB", "teamA"];
  return teams[offset % 2];
}

function getOtherTeam(team: "teamA" | "teamB"): "teamA" | "teamB" {
  return team === "teamA" ? "teamB" : "teamA";
}

// Count completed sequence steps (ban, pick+side_select, decider+side_select)
function countCompletedSteps(actions: VetoAction[]): number {
  let count = 0;
  const maps = new Map<string, { hasPick: boolean; hasSideSelect: boolean; isDecider: boolean }>();

  for (const action of actions) {
    if (action.type === "ban") {
      count++;
    } else if (action.type === "pick" || action.type === "decider") {
      const existing = maps.get(action.map) || { hasPick: false, hasSideSelect: false, isDecider: false };
      existing.hasPick = true;
      existing.isDecider = action.type === "decider";
      maps.set(action.map, existing);
    } else if (action.type === "side_select") {
      const existing = maps.get(action.map) || { hasPick: false, hasSideSelect: false, isDecider: false };
      existing.hasSideSelect = true;
      maps.set(action.map, existing);
    }
  }

  // Count completed picks/deciders (those with side selection)
  for (const [, data] of maps) {
    if (data.hasPick && data.hasSideSelect) {
      count++;
    }
  }

  return count;
}

// Get maps that have been used (banned, picked, or decider)
function getUsedMaps(actions: VetoAction[]): string[] {
  return actions
    .filter((a) => a.type === "ban" || a.type === "pick" || a.type === "decider")
    .map((a) => a.map);
}

// ============= ADMIN FUNCTIONS =============

export const create = mutation({
  args: {
    name: v.string(),
    format: v.union(v.literal("bo1"), v.literal("bo3"), v.literal("bo5")),
    teamAName: v.string(),
    teamATag: v.string(),
    teamBName: v.string(),
    teamBTag: v.string(),
    mapPool: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to create a veto");
    }

    // Validate team names (5-15 characters)
    if (args.teamAName.length < 5 || args.teamAName.length > 15) {
      throw new Error("Team A name must be 5-15 characters");
    }
    if (args.teamBName.length < 5 || args.teamBName.length > 15) {
      throw new Error("Team B name must be 5-15 characters");
    }

    // Validate team tags (1-5 characters)
    if (args.teamATag.length < 1 || args.teamATag.length > 5) {
      throw new Error("Team A tag must be 1-5 characters");
    }
    if (args.teamBTag.length < 1 || args.teamBTag.length > 5) {
      throw new Error("Team B tag must be 1-5 characters");
    }

    const mapPool = args.mapPool ?? DEFAULT_MAP_POOL;

    if (mapPool.length < 7) {
      throw new Error("Map pool must have at least 7 maps");
    }

    const vetoId = await ctx.db.insert("vetos", {
      adminId: userId,
      name: args.name,
      format: args.format,
      mapPool,
      teamA: {
        name: args.teamAName,
        tag: args.teamATag.toUpperCase(),
        token: generateToken(),
      },
      teamB: {
        name: args.teamBName,
        tag: args.teamBTag.toUpperCase(),
        token: generateToken(),
      },
      status: "waiting",
      actions: [],
      teamAConnected: false,
      teamBConnected: false,
      createdAt: Date.now(),
    });

    return vetoId;
  },
});

export const listMyVetos = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const vetos = await ctx.db
      .query("vetos")
      .withIndex("by_admin", (q) => q.eq("adminId", userId))
      .order("desc")
      .collect();

    return vetos;
  },
});

export const getAsAdmin = query({
  args: { vetoId: v.id("vetos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const veto = await ctx.db.get(args.vetoId);
    if (!veto) {
      throw new Error("Veto not found");
    }

    if (veto.adminId !== userId) {
      throw new Error("Not authorized to view this veto");
    }

    return veto;
  },
});

export const startVeto = mutation({
  args: {
    vetoId: v.id("vetos"),
    firstPick: v.union(v.literal("teamA"), v.literal("teamB")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const veto = await ctx.db.get(args.vetoId);
    if (!veto) {
      throw new Error("Veto not found");
    }

    if (veto.adminId !== userId) {
      throw new Error("Not authorized");
    }

    if (veto.status !== "waiting" && veto.status !== "coin_flip") {
      throw new Error("Veto already started or completed");
    }

    const sequence = VETO_SEQUENCES[veto.format];
    const firstAction = sequence[0];
    const firstTeam = getTeamFromOffset(args.firstPick, firstAction.teamOffset);

    await ctx.db.patch(args.vetoId, {
      status: "in_progress",
      firstPick: args.firstPick,
      currentTurn: firstTeam,
      currentPhase: firstAction.type === "decider" ? "side_select" : firstAction.type,
    });
  },
});

export const resetVeto = mutation({
  args: { vetoId: v.id("vetos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const veto = await ctx.db.get(args.vetoId);
    if (!veto) {
      throw new Error("Veto not found");
    }

    if (veto.adminId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(args.vetoId, {
      status: "waiting",
      firstPick: undefined,
      currentTurn: undefined,
      currentPhase: undefined,
      actions: [],
      pendingSideSelectionMap: undefined,
    });
  },
});

export const deleteVeto = mutation({
  args: { vetoId: v.id("vetos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    const veto = await ctx.db.get(args.vetoId);
    if (!veto) {
      throw new Error("Veto not found");
    }

    if (veto.adminId !== userId) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(args.vetoId);
  },
});

// ============= CAPTAIN FUNCTIONS =============

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const vetoA = await ctx.db
      .query("vetos")
      .withIndex("by_teamA_token", (q) => q.eq("teamA.token", args.token))
      .first();

    if (vetoA) {
      return {
        veto: sanitizeVetoForCaptain(vetoA),
        team: "teamA" as const,
      };
    }

    const vetoB = await ctx.db
      .query("vetos")
      .withIndex("by_teamB_token", (q) => q.eq("teamB.token", args.token))
      .first();

    if (vetoB) {
      return {
        veto: sanitizeVetoForCaptain(vetoB),
        team: "teamB" as const,
      };
    }

    return null;
  },
});

// Sanitize veto for captain view (remove tokens, don't include console/action history)
function sanitizeVetoForCaptain(veto: Doc<"vetos">) {
  return {
    _id: veto._id,
    name: veto.name,
    format: veto.format,
    mapPool: veto.mapPool,
    teamA: { name: veto.teamA.name, tag: veto.teamA.tag },
    teamB: { name: veto.teamB.name, tag: veto.teamB.tag },
    status: veto.status,
    firstPick: veto.firstPick,
    currentTurn: veto.currentTurn,
    currentPhase: veto.currentPhase,
    // Only include essential action info for displaying map states (no timestamps)
    actions: veto.actions.map((a) => ({
      type: a.type,
      map: a.map,
      team: a.team,
      side: a.side,
    })),
    pendingSideSelectionMap: veto.pendingSideSelectionMap,
    teamAConnected: veto.teamAConnected,
    teamBConnected: veto.teamBConnected,
  };
}

export const captainConnect = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const vetoA = await ctx.db
      .query("vetos")
      .withIndex("by_teamA_token", (q) => q.eq("teamA.token", args.token))
      .first();

    if (vetoA) {
      await ctx.db.patch(vetoA._id, { teamAConnected: true });
      return { vetoId: vetoA._id, team: "teamA" as const };
    }

    const vetoB = await ctx.db
      .query("vetos")
      .withIndex("by_teamB_token", (q) => q.eq("teamB.token", args.token))
      .first();

    if (vetoB) {
      await ctx.db.patch(vetoB._id, { teamBConnected: true });
      return { vetoId: vetoB._id, team: "teamB" as const };
    }

    throw new Error("Invalid token");
  },
});

export const banMap = mutation({
  args: {
    token: v.string(),
    map: v.string(),
  },
  handler: async (ctx, args) => {
    const { veto, team, vetoId } = await getVetoByToken(ctx, args.token);

    if (veto.status !== "in_progress") {
      throw new Error("Veto is not in progress");
    }

    if (veto.currentPhase !== "ban") {
      throw new Error("Current phase is not ban");
    }

    if (veto.currentTurn !== team) {
      throw new Error("Not your turn");
    }

    const usedMaps = getUsedMaps(veto.actions);

    if (!veto.mapPool.includes(args.map)) {
      throw new Error("Map not in pool");
    }

    if (usedMaps.includes(args.map)) {
      throw new Error("Map already banned or picked");
    }

    // Record the ban with timestamp
    const newActions: VetoAction[] = [
      ...veto.actions,
      { type: "ban" as const, map: args.map, team, timestamp: Date.now() },
    ];

    // Determine what comes next
    const sequence = VETO_SEQUENCES[veto.format];
    const completedSteps = countCompletedSteps(newActions);

    if (completedSteps >= sequence.length) {
      // Veto complete
      await ctx.db.patch(vetoId, {
        actions: newActions,
        status: "completed",
        currentTurn: undefined,
        currentPhase: undefined,
      });
      return;
    }

    const nextAction = sequence[completedSteps];
    const nextTeam = getTeamFromOffset(veto.firstPick!, nextAction.teamOffset);

    // Check if next is decider
    if (nextAction.type === "decider") {
      // Find the remaining map
      const allUsedMaps = getUsedMaps(newActions);
      const remainingMaps = veto.mapPool.filter((m) => !allUsedMaps.includes(m));

      if (remainingMaps.length === 1) {
        // Add decider action with timestamp
        const deciderActions: VetoAction[] = [
          ...newActions,
          { type: "decider" as const, map: remainingMaps[0], team: "none" as const, timestamp: Date.now() },
        ];

        await ctx.db.patch(vetoId, {
          actions: deciderActions,
          currentTurn: nextTeam,
          currentPhase: "side_select",
          pendingSideSelectionMap: remainingMaps[0],
        });
        return;
      }
    }

    await ctx.db.patch(vetoId, {
      actions: newActions,
      currentTurn: nextTeam,
      currentPhase: nextAction.type as "ban" | "pick",
    });
  },
});

export const pickMap = mutation({
  args: {
    token: v.string(),
    map: v.string(),
  },
  handler: async (ctx, args) => {
    const { veto, team, vetoId } = await getVetoByToken(ctx, args.token);

    if (veto.status !== "in_progress") {
      throw new Error("Veto is not in progress");
    }

    if (veto.currentPhase !== "pick") {
      throw new Error("Current phase is not pick");
    }

    if (veto.currentTurn !== team) {
      throw new Error("Not your turn");
    }

    const usedMaps = getUsedMaps(veto.actions);

    if (!veto.mapPool.includes(args.map)) {
      throw new Error("Map not in pool");
    }

    if (usedMaps.includes(args.map)) {
      throw new Error("Map already banned or picked");
    }

    // Record the pick with timestamp
    const newActions: VetoAction[] = [
      ...veto.actions,
      { type: "pick" as const, map: args.map, team, timestamp: Date.now() },
    ];

    // After a pick, the OTHER team selects side
    const otherTeam = getOtherTeam(team);

    await ctx.db.patch(vetoId, {
      actions: newActions,
      currentPhase: "side_select",
      currentTurn: otherTeam,
      pendingSideSelectionMap: args.map,
    });
  },
});

export const selectSide = mutation({
  args: {
    token: v.string(),
    side: v.union(v.literal("attack"), v.literal("defense")),
  },
  handler: async (ctx, args) => {
    const { veto, team, vetoId } = await getVetoByToken(ctx, args.token);

    if (veto.status !== "in_progress") {
      throw new Error("Veto is not in progress");
    }

    if (veto.currentPhase !== "side_select") {
      throw new Error("Current phase is not side selection");
    }

    if (veto.currentTurn !== team) {
      throw new Error("Not your turn to select side");
    }

    if (!veto.pendingSideSelectionMap) {
      throw new Error("No pending side selection");
    }

    // Add side_select as a separate action with timestamp
    const newActions: VetoAction[] = [
      ...veto.actions,
      {
        type: "side_select" as const,
        map: veto.pendingSideSelectionMap,
        team,
        side: args.side,
        timestamp: Date.now(),
      },
    ];

    // Determine what comes next
    const sequence = VETO_SEQUENCES[veto.format];
    const completedSteps = countCompletedSteps(newActions);

    if (completedSteps >= sequence.length) {
      // Veto complete
      await ctx.db.patch(vetoId, {
        actions: newActions,
        status: "completed",
        currentTurn: undefined,
        currentPhase: undefined,
        pendingSideSelectionMap: undefined,
      });
      return;
    }

    const nextAction = sequence[completedSteps];
    const nextTeam = getTeamFromOffset(veto.firstPick!, nextAction.teamOffset);

    // Check if next is decider
    if (nextAction.type === "decider") {
      // Find the remaining map
      const allUsedMaps = getUsedMaps(newActions);
      const remainingMaps = veto.mapPool.filter((m) => !allUsedMaps.includes(m));

      if (remainingMaps.length === 1) {
        // Add decider action with timestamp
        const deciderActions: VetoAction[] = [
          ...newActions,
          { type: "decider" as const, map: remainingMaps[0], team: "none" as const, timestamp: Date.now() },
        ];

        await ctx.db.patch(vetoId, {
          actions: deciderActions,
          currentTurn: nextTeam,
          currentPhase: "side_select",
          pendingSideSelectionMap: remainingMaps[0],
        });
        return;
      }
    }

    await ctx.db.patch(vetoId, {
      actions: newActions,
      currentTurn: nextTeam,
      currentPhase: nextAction.type as "ban" | "pick",
      pendingSideSelectionMap: undefined,
    });
  },
});

// ============= HELPER FUNCTIONS =============

async function getVetoByToken(
  ctx: QueryCtx | MutationCtx,
  token: string
): Promise<{
  veto: Doc<"vetos">;
  team: "teamA" | "teamB";
  vetoId: Id<"vetos">;
}> {
  const vetoA = await ctx.db
    .query("vetos")
    .withIndex("by_teamA_token", (q) => q.eq("teamA.token", token))
    .first();

  if (vetoA) {
    return { veto: vetoA, team: "teamA" as const, vetoId: vetoA._id };
  }

  const vetoB = await ctx.db
    .query("vetos")
    .withIndex("by_teamB_token", (q) => q.eq("teamB.token", token))
    .first();

  if (vetoB) {
    return { veto: vetoB, team: "teamB" as const, vetoId: vetoB._id };
  }

  throw new Error("Invalid token");
}

// ============= ADMIN CLEANUP =============

export const clearAllVetos = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in");
    }

    // Delete all vetos belonging to this admin
    const vetos = await ctx.db
      .query("vetos")
      .withIndex("by_admin", (q) => q.eq("adminId", userId))
      .collect();

    for (const veto of vetos) {
      await ctx.db.delete(veto._id);
    }

    return { deleted: vetos.length };
  },
});

// ============= PUBLIC QUERY =============

export const getPublic = query({
  args: { vetoId: v.id("vetos") },
  handler: async (ctx, args) => {
    const veto = await ctx.db.get(args.vetoId);
    if (!veto) {
      return null;
    }

    return sanitizeVetoForCaptain(veto);
  },
});
