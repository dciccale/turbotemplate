import { expect, it } from "vitest";
import { product } from "../src";
import { emailText } from "../src/email";

it("renders email messages in the captured language", () => {
  expect(emailText("en")("subject", { brand: product.name })).toBe(
    `Welcome to ${product.name}`,
  );
  expect(emailText("es")("subject", { brand: product.name })).toBe(
    `Te damos la bienvenida a ${product.name}`,
  );
  expect(emailText("es")("greeting", { name: "Ada" })).toBe(
    "Te damos la bienvenida, Ada",
  );
});
