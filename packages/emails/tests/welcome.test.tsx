import { product } from "@turbotemplate/i18n";
import { expect, it } from "vitest";
import { renderWelcomeEmail } from "../render";

it.each(["en", "es"] as const)(
  "renders the %s welcome email without missing messages",
  async (locale) => {
    const html = await renderWelcomeEmail({
      locale,
      appUrl: "https://example.com/app",
      name: "Ada <script>",
    });
    expect(html).toContain(`lang="${locale}"`);
    expect(html).toContain(product.name);
    expect(html).toContain("Ada &lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain(
      locale === "es" ? "Abrir espacio de trabajo" : "Open workspace",
    );
    expect(
      await renderWelcomeEmail({
        locale,
        appUrl: "https://example.com/app",
        name: "Ada <script>",
      }),
    ).toBe(html);
  },
);
