/**
 * Original source code available from: https://ui.shadcn.com/docs/dark-mode/vite
 */

import { useTheme } from "@/components/theme-provider"
import { 
  ThemeToggleButton,
  useThemeTransition
} from "@/components/ui/shadcn-io/theme-toggle-button"
import { useCallback } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const { startTransition } = useThemeTransition()

  const handleThemeToggle = useCallback(() => {
    const newMode = theme === "dark" ? "light" : "dark"
    startTransition(() => setTheme(newMode))
  }, [theme, setTheme, startTransition])

  const currentTheme = theme === "system" ? "light" : theme

  return (
    <ThemeToggleButton
      theme={currentTheme}
      onClick={handleThemeToggle}
      variant="circle-blur"
      start="top-right"
    />
  )
}