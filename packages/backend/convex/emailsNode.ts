"use node";

import { renderWelcomeEmail } from "@turbotemplate/emails";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { resend } from "./resend";

function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} env var`);
  }
  return value;
}

export const sendWelcomeEmail = internalAction({
  args: {
    to: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const from = getRequiredEnvVar("RESEND_FROM_EMAIL");
    const appUrl = getRequiredEnvVar("APP_ORIGIN");

    const html = await renderWelcomeEmail({
      name: args.name,
      appUrl,
    });

    await resend.sendEmail(ctx, {
      from,
      to: args.to,
      subject: "Welcome to Turbotemplate",
      html,
    });

    return null;
  },
});
