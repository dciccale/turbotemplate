// @vitest-environment node
/// <reference types="vite/client" />
import { register } from "@clipin/convex-plunk/test";
import type { FunctionArgs } from "convex/server";
import { convexTest } from "convex-test";
import { afterEach, expect, test, vi } from "vitest";
import { components, internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const welcome = {
  to: "reader@example.com",
  locale: "es",
  idempotencyKey: "welcome:test-user",
} satisfies FunctionArgs<typeof internal.emailsNode.sendWelcomeEmail>;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

test("the default provider queues one Plunk test email for a repeated event", async () => {
  vi.useFakeTimers();
  vi.stubEnv("APP_ORIGIN", "https://example.com");
  vi.stubEnv("EMAIL_DELIVERY_PROVIDER", undefined);
  vi.stubEnv("PLUNK_FROM_EMAIL", "hello@example.com");
  vi.stubEnv("PLUNK_TEST_MODE", "true");
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const t = convexTest(schema, modules);
  register(t);

  await t.action(internal.emailsNode.sendWelcomeEmail, welcome);
  await t.action(internal.emailsNode.sendWelcomeEmail, welcome);
  await vi.advanceTimersByTimeAsync(0);
  await t.finishInProgressScheduledFunctions();
  await t.finishAllScheduledFunctions(vi.runAllTimers);

  const { page } = await t.run((ctx) =>
    ctx.runQuery(components.plunk.lib.list, {
      paginationOpts: { cursor: null, numItems: 10 },
    }),
  );
  expect(page).toHaveLength(1);
  expect(page[0]).toMatchObject({
    state: "test",
    message: { from: "hello@example.com", to: welcome.to },
  });
  expect(fetch).not.toHaveBeenCalled();
});

test("Resend sends to a test recipient and blocks real recipients in test mode", async () => {
  vi.stubEnv("APP_ORIGIN", "https://example.com");
  vi.stubEnv("EMAIL_DELIVERY_PROVIDER", "resend");
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("RESEND_FROM_EMAIL", "Template <hello@example.com>");
  vi.stubEnv("RESEND_TEST_MODE", "true");
  const fetch = vi.fn(async (url: string, options: RequestInit) => {
    const request = new Request(url, options);
    expect(request.url).toBe("https://api.resend.com/emails");
    expect(request.headers.get("idempotency-key")).toBe(welcome.idempotencyKey);
    expect(await request.json()).toMatchObject({
      from: "Template <hello@example.com>",
      to: "delivered@resend.dev",
      html: expect.stringContaining("lang=es"),
    });
    return Response.json({ id: "test-email" });
  });
  vi.stubGlobal("fetch", fetch);
  const t = convexTest(schema, modules);

  await expect(
    t.action(internal.emailsNode.sendWelcomeEmail, welcome),
  ).rejects.toThrow("Resend test mode requires a Resend test recipient");
  await t.action(internal.emailsNode.sendWelcomeEmail, {
    ...welcome,
    to: "delivered@resend.dev",
  });
  expect(fetch).toHaveBeenCalledTimes(1);
});
