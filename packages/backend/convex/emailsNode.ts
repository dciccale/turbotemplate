"use node";

import { renderWelcomeEmail } from "@turbotemplate/emails";
import { product } from "@turbotemplate/i18n";
import { emailText } from "@turbotemplate/i18n/email";
import { v } from "convex/values";
import { Resend } from "resend";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";
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
    idempotencyKey: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const provider = process.env.EMAIL_DELIVERY_PROVIDER ?? "plunk";
    if (provider !== "plunk" && provider !== "resend") {
      throw new Error("EMAIL_DELIVERY_PROVIDER must be plunk or resend");
    }

    const appUrl = new URL("/app", getRequiredEnvVar("APP_ORIGIN"));
    appUrl.searchParams.set("lang", args.locale);

    const html = await renderWelcomeEmail({
      locale: args.locale,
      name: args.name,
      appUrl: appUrl.href,
    });

    const message = {
      to: args.to,
      subject: emailText(args.locale)("subject", { brand: product.name }),
      html,
    };
    const idempotencyKey =
      args.idempotencyKey ?? `welcome:${crypto.randomUUID()}`;

    if (provider === "plunk") {
      await ctx.runMutation(internal.plunk.enqueue, {
        ...message,
        idempotencyKey,
      });
    } else {
      if (
        process.env.RESEND_TEST_MODE !== "false" &&
        !/^(delivered|bounced|complained)(\+[a-z0-9_-]*)?@resend\.dev$/i.test(
          args.to,
        )
      ) {
        throw new Error("Resend test mode requires a Resend test recipient");
      }
      const resend = new Resend(getRequiredEnvVar("RESEND_API_KEY"));
      const { error } = await resend.emails.send(
        { ...message, from: getRequiredEnvVar("RESEND_FROM_EMAIL") },
        { idempotencyKey },
      );
      if (error) throw new Error(`Resend email send failed: ${error.name}`);
    }

    return null;
  },
});
