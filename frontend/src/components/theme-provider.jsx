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

  /* Non-system mode */
  useEffect(() => {
    if (mode === "system") {
      return;
    }
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    setTheme(mode);
  }, [mode]);

  /* System mode */
  useEffect(() => {
    if (mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applySystemTheme = () => {
      const systemTheme = media.matches ? "dark" : "light";
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
      setTheme(systemTheme);
    };

    applySystemTheme();
    media.addEventListener("change", applySystemTheme);

    return () => {
      media.removeEventListener("change", applySystemTheme);
    };
  }, [mode, theme]);

  const value = {
    mode,
    theme,
    setMode: (theme) => {
      localStorage.setItem(storageKey, theme);
      setMode(theme);
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
