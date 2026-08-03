import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("kosmos-theme") as Theme | null;
    const initial = stored ?? "dark";
    document.documentElement.setAttribute("data-theme", initial === "light" ? "light" : "");
    return initial;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "");
    localStorage.setItem("kosmos-theme", theme);
  }, [theme]);

  function toggleTheme(): void {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
