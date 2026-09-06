#!/usr/bin/env bun
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "@babel/parser";

const allowlist: unknown = JSON.parse(
  await readFile("i18n-allowlist.json", "utf8"),
);
const allowed = new Set(
  allowlist && typeof allowlist === "object" ? Object.keys(allowlist) : [],
);
const failures: string[] = [];
function check(text: string, file: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (/[A-Za-zÀ-ÿ]/.test(normalized) && !allowed.has(normalized))
    failures.push(`${file}: ${normalized}`);
}
function visit(value: unknown, file: string) {
  if (!value || typeof value !== "object") return;
  if (
    "type" in value &&
    value.type === "JSXText" &&
    "value" in value &&
    typeof value.value === "string"
  )
    check(value.value, file);
  if (
    "type" in value &&
    value.type === "JSXAttribute" &&
    "name" in value &&
    value.name &&
    typeof value.name === "object" &&
    "name" in value.name &&
    typeof value.name.name === "string" &&
    ["aria-label", "title", "placeholder", "tooltip", "alt"].includes(
      value.name.name,
    ) &&
    "value" in value &&
    value.value &&
    typeof value.value === "object" &&
    "type" in value.value &&
    value.value.type === "StringLiteral" &&
    "value" in value.value &&
    typeof value.value.value === "string"
  )
    check(value.value.value, file);
  for (const [key, child] of Object.entries(value)) {
    if (["loc", "start", "end", "extra"].includes(key)) continue;
    if (Array.isArray(child)) for (const item of child) visit(item, file);
    else if (child && typeof child === "object") visit(child, file);
  }
}
async function scan(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (file.endsWith(".tsx") && !file.includes(".test."))
      visit(
        parse(await readFile(file, "utf8"), {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        }),
        file,
      );
  }
}
for (const directory of process.argv.slice(2)) await scan(directory);
if (failures.length)
  throw new Error(`Untranslated interface literals:\n${failures.join("\n")}`);
console.info("Interface copy scan passed.");
