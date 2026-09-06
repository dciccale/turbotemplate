/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
test("language writes require authentication", async () => {
  const t = convexTest(schema, modules);
  await expect(
    t.mutation(api.settings.setLocale, { locale: "es" }),
  ).rejects.toThrow();
});
test("language writes preserve theme and isolate accounts", async () => {
  const t = convexTest(schema, modules);
  const alice = t.withIdentity({ subject: "alice" });
  const bob = t.withIdentity({ subject: "bob" });
  await t.run(async (ctx) => {
    await ctx.db.insert("settings", {
      userId: "alice",
      theme: "dark",
      updatedAt: 0,
    });
  });
  await alice.mutation(api.settings.setLocale, { locale: "es" });
  expect(await alice.query(api.settings.get)).toMatchObject({
    locale: "es",
    theme: "dark",
  });
  expect(await bob.query(api.settings.get)).toMatchObject({
    userId: "bob",
    theme: "system",
  });
  await bob.mutation(api.settings.setLocale, { locale: "en" });
  expect(await bob.query(api.settings.get)).toMatchObject({
    locale: "en",
    theme: "system",
  });
  expect(await alice.query(api.settings.get)).toMatchObject({
    locale: "es",
    theme: "dark",
  });
});
test("visitor adoption cannot override an existing account preference", async () => {
  const t = convexTest(schema, modules).withIdentity({ subject: "alice" });
  await t.mutation(api.settings.setLocale, { locale: "en" });
  await t.mutation(api.settings.setLocale, { locale: "es", adoptOnly: true });
  expect(await t.query(api.settings.get)).toMatchObject({ locale: "en" });
});
