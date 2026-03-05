import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

const testMode =
  process.env.RESEND_TEST_MODE == null
    ? true
    : process.env.RESEND_TEST_MODE !== "false";

export const resend = new Resend(components.resend, {
  testMode,
});
