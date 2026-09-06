import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { localeValidator } from "./validators";
export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    return {
      userId: identity.subject,
      locale: settings?.locale,
      theme: settings?.theme ?? "system",
    };
  },
});
export const setLocale = mutation({
  args: { locale: localeValidator, adoptOnly: v.optional(v.boolean()) },
  handler: async (ctx, { locale, adoptOnly }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError({ code: "UNAUTHENTICATED" });
    // This deployment has one Clerk issuer; retain the existing subject ownership key.
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();
    if (adoptOnly && settings?.locale) return settings.locale;
    if (settings)
      await ctx.db.patch("settings", settings._id, {
        locale,
        updatedAt: Date.now(),
      });
    else
      await ctx.db.insert("settings", {
        userId: identity.subject,
        locale,
        theme: "system",
        updatedAt: Date.now(),
      });
    return locale;
  },
});
