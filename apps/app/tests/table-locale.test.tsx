import { fireEvent, render, screen } from "@testing-library/react";
import en from "@turbotemplate/i18n/messages/en.json";
import es from "@turbotemplate/i18n/messages/es.json";
import { NextIntlClientProvider } from "next-intl";
import { expect, it } from "vitest";
import { DataTable } from "../components/data-table";

const data = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  header: `Document ${index + 1}`,
  type: "Narrative",
  status: "Done",
  target: "12",
  limit: "20",
  reviewer: "Eddie Lake",
}));
it("preserves edited fields, selection and pagination when language changes", () => {
  const { rerender } = render(
    <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
      <DataTable data={data} />
    </NextIntlClientProvider>,
  );
  const input = screen.getAllByRole("textbox", { name: "Target" })[0];
  if (!input) throw new Error("Missing target input");
  fireEvent.change(input, { target: { value: "42" } });
  const checkbox = screen.getAllByRole("checkbox", { name: "Select row" })[0];
  if (!checkbox) throw new Error("Missing row selection");
  fireEvent.click(checkbox);
  rerender(
    <NextIntlClientProvider locale="es" messages={es} timeZone="UTC">
      <DataTable data={data} />
    </NextIntlClientProvider>,
  );
  expect(screen.getAllByRole("textbox", { name: "Objetivo" })[0]).toBe(input);
  expect(input).toHaveProperty("value", "42");
  expect(
    screen
      .getAllByRole("checkbox", { name: "Seleccionar fila" })[0]
      ?.getAttribute("data-state"),
  ).toBe("checked");
  fireEvent.click(
    screen.getByRole("button", { name: "Ir a la página siguiente" }),
  );
  expect(screen.getByText("Document 11")).toBeTruthy();
  rerender(
    <NextIntlClientProvider locale="en" messages={en} timeZone="UTC">
      <DataTable data={data} />
    </NextIntlClientProvider>,
  );
  expect(screen.getByText("Document 11")).toBeTruthy();
  expect(screen.queryByText("Document 1")).toBeNull();
});
