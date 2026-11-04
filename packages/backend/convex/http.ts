import { registerRoutes } from "@convex-dev/stripe";
import { httpRouter } from "convex/server";
import { components } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { plunk } from "./plunk";

const http = httpRouter();

http.route({
  path: "/plunk-webhook",
  method: "POST",
  handler: httpAction((ctx, request) => plunk.handleWebhook(ctx, request)),
});

// Register Stripe webhook handler at /stripe/webhook
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
});

export default http;
