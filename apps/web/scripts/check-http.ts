import assert from "node:assert/strict";

const origin = process.env.I18N_TEST_ORIGIN ?? "http://localhost:3100";
async function request(path: string, headers: Record<string, string> = {}) {
  return fetch(new URL(path, origin), { headers, redirect: "manual" });
}
const english = await request("/", { "accept-language": "en" });
assert.equal(english.status, 200);
assert.equal(english.headers.get("content-language"), "en");
assert.match(english.headers.get("cache-control") ?? "", /no-store/i);
const vary = (english.headers.get("vary") ?? "").toLowerCase().split(/,\s*/);
assert.ok(
  vary.includes("accept-language"),
  "Home must vary by Accept-Language",
);
assert.ok(vary.includes("cookie"), "Home must vary by Cookie");
const spanish = await request("/?campaign=test", { "accept-language": "es" });
assert.equal(spanish.status, 307);
assert.equal(
  new URL(spanish.headers.get("location") ?? "", origin).pathname,
  "/es",
);
assert.equal(
  new URL(spanish.headers.get("location") ?? "", origin).search,
  "?campaign=test",
);
for (const path of ["/es", "/es/pricing", "/es/faq"]) {
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-language"), "es");
  assert.match(await response.text(), /<html[^>]*lang="es"/);
}
const missing = await request("/es/no-such-page");
assert.equal(missing.status, 404);
assert.equal(missing.headers.get("content-language"), "es");
assert.match(await missing.text(), /<html[^>]*lang="es"/);
console.info("Production HTTP locale checks passed");
