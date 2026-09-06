import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { localeValidator } from "./validators";

// All ownership is enforced via Clerk user id (identity.subject)
export default defineSchema({
  settings: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),
    locale: v.optional(localeValidator),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),
});
