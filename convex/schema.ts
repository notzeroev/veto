import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,

  // Veto sessions created by admins
  vetos: defineTable({
    // Admin who created this veto
    adminId: v.id("users"),

    // Veto configuration
    name: v.string(), // e.g., "Grand Finals - Team A vs Team B"
    format: v.union(v.literal("bo1"), v.literal("bo3"), v.literal("bo5")),
    mapPool: v.array(v.string()), // Available maps to pick/ban from

    // Team information
    teamA: v.object({
      name: v.string(),
      token: v.string(), // Unique invite token for captain
    }),
    teamB: v.object({
      name: v.string(),
      token: v.string(), // Unique invite token for captain
    }),

    // Veto state
    status: v.union(
      v.literal("waiting"), // Waiting for captains to join
      v.literal("coin_flip"), // Determining who goes first
      v.literal("in_progress"), // Pick/ban in progress
      v.literal("completed") // Veto finished
    ),

    // Who starts first (determined by coin flip or admin)
    firstPick: v.optional(v.union(v.literal("teamA"), v.literal("teamB"))),

    // Current turn state
    currentTurn: v.optional(v.union(v.literal("teamA"), v.literal("teamB"))),
    currentPhase: v.optional(
      v.union(
        v.literal("ban"),
        v.literal("pick"),
        v.literal("side_select") // After a map is picked, opponent selects side
      )
    ),

    // Track all veto events with timestamps
    // Each event is its own entry: ban, pick, decider, side_select
    actions: v.array(
      v.object({
        type: v.union(
          v.literal("ban"),
          v.literal("pick"),
          v.literal("decider"), // Auto-picked final map
          v.literal("side_select") // Side selection is now its own event
        ),
        map: v.string(),
        team: v.union(v.literal("teamA"), v.literal("teamB"), v.literal("none")),
        // For side_select action type only
        side: v.optional(v.union(v.literal("attack"), v.literal("defense"))),
        // Timestamp when this action occurred
        timestamp: v.number(),
      })
    ),

    // The map currently awaiting side selection (if any)
    pendingSideSelectionMap: v.optional(v.string()),

    // Captain connection status
    teamAConnected: v.boolean(),
    teamBConnected: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_teamA_token", ["teamA.token"])
    .index("by_teamB_token", ["teamB.token"]),
});

export default schema;
