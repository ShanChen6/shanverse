"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/client";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { locale } = useI18n();
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
  const toggleLabel = locale === "vi"
    ? isMounted ? `Chuyển sang giao diện ${isDarkMode ? "sáng" : "tối"}` : "Đổi giao diện màu"
    : isMounted ? `Switch to ${isDarkMode ? "light" : "dark"} mode` : "Toggle color theme";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={toggleLabel}
      disabled={!isMounted}
      className="relative"
    >
      {isDarkMode ? (
        <Sun className="size-5" aria-hidden="true" />
      ) : (
        <Moon className="size-5" aria-hidden="true" />
      )}
    </Button>
  );
}
