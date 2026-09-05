"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const toggleTheme = React.useCallback(() => {
    if (!isMounted) return;

    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [isMounted, resolvedTheme, setTheme]);

  const isDarkMode = isMounted && resolvedTheme === "dark";
  const toggleLabel = isMounted
    ? `Switch to ${isDarkMode ? "light" : "dark"} mode`
    : "Toggle color theme";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={toggleLabel}
      disabled={!isMounted}
    >
      <span className="sr-only">Toggle theme</span>
      {isDarkMode ? (
        <Sun className="h-6 w-6" aria-hidden="true" />
      ) : (
        <Moon className="h-6 w-6" aria-hidden="true" />
      )}
    </Button>
  );
}
