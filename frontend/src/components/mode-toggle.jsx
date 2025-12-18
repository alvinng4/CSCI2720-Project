// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

/**
 * Original, unmodified source code available from: https://ui.shadcn.com/docs/dark-mode/vite
 */

import { useTheme } from "@/components/theme-provider";
import {
  ThemeToggleButton,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";
import { useCallback } from "react";

export function ModeToggle() {
  const { mode, setMode } = useTheme();
  const { startTransition } = useThemeTransition();

  const handleThemeToggle = useCallback(() => {
    const nextMode =
      mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    startTransition(() => setMode(nextMode));
  }, [mode, setMode, startTransition]);

  return (
    <ThemeToggleButton
      theme={mode}
      onClick={handleThemeToggle}
      variant="circle-blur"
      start="top-right"
    />
  );
}
