/**
 * Original, unmodified source code available from: https://ui.shadcn.com/docs/dark-mode/vite
 */

import { createContext, useContext, useEffect, useState } from "react";

const initialState = {
  mode: "system",
  theme: "light",
  setMode: () => null,
};

const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultMode = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [mode, setMode] = useState(
    () => localStorage.getItem(storageKey) || defaultMode
  );
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const root = window.document.documentElement;

    if (mode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const systemTheme = media.matches ? "dark" : "light";
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      setTheme(systemTheme);

      const applySystemTheme = () => {
        const newSystemTheme = media.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(newSystemTheme);
        setTheme(newSystemTheme);
      };

      media.addEventListener("change", applySystemTheme);
      return () => {
        media.removeEventListener("change", applySystemTheme);
      };
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(mode);
      setTheme(mode);
    }
  }, [mode]);

  const value = {
    mode,
    theme,
    setMode: (newMode) => {
      localStorage.setItem(storageKey, newMode);
      setMode(newMode);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
