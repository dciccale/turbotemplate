"use node";

import { renderWelcomeEmail } from "@turbotemplate/emails";
import { product } from "@turbotemplate/i18n";
import { emailText } from "@turbotemplate/i18n/email";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { resend } from "./resend";
import { localeValidator } from "./validators";

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
    locale: localeValidator,
    name: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const from = getRequiredEnvVar("RESEND_FROM_EMAIL");
    const appUrl = new URL("/app", getRequiredEnvVar("APP_ORIGIN"));
    appUrl.searchParams.set("lang", args.locale);

    const html = await renderWelcomeEmail({
      locale: args.locale,
      name: args.name,
      appUrl: appUrl.href,
    });

    await resend.sendEmail(ctx, {
      from,
      to: args.to,
      subject: emailText(args.locale)("subject", { brand: product.name }),
      html,
    });

    return null;
  },
});
