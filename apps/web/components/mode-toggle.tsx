"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-foreground/80 hover:bg-accent hover:text-accent-foreground transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* sun/moon icons */}
      <Sun className="size-5 dark:hidden" />
      <Moon className="size-5 hidden dark:block" />
    </button>
  );
}
