import { Plunk } from "@clipin/convex-plunk";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const testMode = process.env.PLUNK_TEST_MODE !== "false";
export const plunk = new Plunk(components.plunk, { testMode });
export const deliver = plunk.worker();

export const enqueue = internalMutation({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    idempotencyKey: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    const from = process.env.PLUNK_FROM_EMAIL;
    if (!from) throw new Error("Missing PLUNK_FROM_EMAIL env var");
    if (!testMode && !process.env.PLUNK_API_KEY) {
      throw new Error("Missing PLUNK_API_KEY env var");
    }
    return plunk.sendEmail(ctx, {
      ...args,
      from,
      worker: internal.plunk.deliver,
    });
  },
});
