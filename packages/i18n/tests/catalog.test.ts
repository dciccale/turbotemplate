import { expect, it } from "vitest";
import { checkCatalog } from "../src/catalog";
import en from "../src/messages/en.json";
import es from "../src/messages/es.json";

it("validates shipped catalogs", () =>
  expect(() => checkCatalog(en, es)).not.toThrow());
it.each([
  [{ hello: "Hi" }, {}],
  [{ hello: "Hi" }, { hello: "Hola", extra: "Extra" }],
  [{ hello: "Hi" }, { hello: "" }],
  [{ hello: "Hi {name}" }, { hello: "Hola {user}" }],
  [{ hello: "Hi {name}" }, { hello: "Hola {name" }],
  [{ hello: "<link>Hello</link>" }, { hello: "<strong>Hola</strong>" }],
])("rejects incompatible catalogs", (source, target) =>
  expect(() => checkCatalog(source, target)).toThrow(),
);
it("accepts translated ICU plurals", () =>
  expect(() =>
    checkCatalog(
      { count: "{count, plural, one {# row} other {# rows}}" },
      { count: "{count, plural, one {# fila} other {# filas}}" },
    ),
  ).not.toThrow());
