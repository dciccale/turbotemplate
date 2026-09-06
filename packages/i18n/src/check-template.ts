import { execFileSync } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { product } from "./index";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const directory = await mkdtemp(join(tmpdir(), "i18n-template-"));
const name = `language-starter-${Date.now()}`;
execFileSync("bash", [resolve(root, "bin/create.sh"), name], {
  cwd: directory,
  stdio: "pipe",
});
const generated = join(directory, name);
const manifest = JSON.parse(
  await readFile(join(generated, "packages/i18n/package.json"), "utf8"),
);
if (manifest.name !== `@${name}/i18n`)
  throw new Error("Generated package name was not replaced");
const config = await readFile(
  join(generated, "packages/i18n/src/index.ts"),
  "utf8",
);
if (config.includes(product.name))
  throw new Error("Generated locale configuration retains template branding");
for (const task of ["check-i18n", "check-types", "test"])
  execFileSync("bun", ["run", task], { cwd: generated, stdio: "inherit" });
console.info(`Generated project passed validation: ${generated}`);
