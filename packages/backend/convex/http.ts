import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { resend } from "./resend";

const http = httpRouter();

http.route({
  path: "/resend-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    return resend.handleResendEventWebhook(ctx, request);
  }),
});

export default http;
