import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import en from "@turbotemplate/i18n/messages/en.json";
import { beforeEach, expect, it, vi } from "vitest";
import { LocaleProvider, useLanguage } from "../components/locale-provider";

const remote = vi.hoisted(() => ({
  userId: "alice",
  settings: { userId: "alice", locale: "en" },
  save: vi.fn(),
}));
vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ userId: remote.userId, isLoaded: true }),
}));
vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useQuery: () => remote.settings,
  useMutation: () => remote.save,
}));
const changed = vi.fn();
function Probe() {
  const { locale, changeLocale, saving, error } = useLanguage();
  return (
    <>
      <input aria-label="draft" defaultValue="draft" />
      <span>{locale}</span>
      <button
        type="button"
        disabled={saving}
        onClick={() => void changeLocale("es")}
      >
        Spanish
      </button>
      {error ? <p role="alert">save failed</p> : null}
    </>
  );
}
function View() {
  return (
    <LocaleProvider
      initialLocale="en"
      initialMessages={en}
      onLocaleChange={changed}
    >
      <Probe />
    </LocaleProvider>
  );
}
beforeEach(() => {
  remote.userId = "alice";
  remote.settings = { userId: "alice", locale: "en" };
  remote.save.mockReset();
  sessionStorage.clear();
  document.cookie = "turbotemplate-locale=; Max-Age=0; Path=/";
});
it("keeps the confirmed language and input on a failed settings save", async () => {
  remote.save.mockRejectedValue(new Error("offline"));
  render(<View />);
  const input = await screen.findByRole("textbox", { name: "draft" });
  fireEvent.change(input, { target: { value: "unsaved work" } });
  fireEvent.click(screen.getByRole("button", { name: "Spanish" }));
  await screen.findByRole("alert");
  expect(screen.getByText("en")).toBeTruthy();
  expect(input).toHaveProperty("value", "unsaved work");
  expect(remote.save).toHaveBeenCalledTimes(1);
});
it("updates language without remounting children", async () => {
  remote.save.mockResolvedValue("es");
  render(<View />);
  const input = await screen.findByRole("textbox", { name: "draft" });
  fireEvent.change(input, { target: { value: "unsaved work" } });
  fireEvent.click(screen.getByRole("button", { name: "Spanish" }));
  await screen.findByText("es");
  expect(screen.getByRole("textbox")).toBe(input);
  expect(input).toHaveProperty("value", "unsaved work");
  expect(document.cookie).toContain("account:es:alice");
});
it("hides the old account while its cached settings remain in the query", async () => {
  const { rerender } = render(<View />);
  await screen.findByRole("textbox");
  remote.userId = "bob";
  rerender(<View />);
  expect(screen.queryByRole("textbox")).toBeNull();
  remote.settings = { userId: "bob", locale: "es" };
  rerender(<View />);
  await waitFor(() => expect(screen.getByText("es")).toBeTruthy());
});
