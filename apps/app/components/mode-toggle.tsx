"use client";

import { Button } from "@turbotemplate/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* sun/moon icons */}
      <Sun className="size-5 dark:hidden" />
      <Moon className="size-5 hidden dark:block" />
    </Button>
  );
}
