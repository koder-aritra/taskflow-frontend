import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode: ThemeMode = "dark";

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#3b82f6" },
          secondary: { main: "#8b5cf6" },
          ...(mode === "dark"
            ? { background: { default: "#0f172a", paper: "#1e293b" } }
            : { background: { default: "#f8fafc", paper: "#ffffff" } }),
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily:
            '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { textTransform: "none", fontWeight: 600 },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                transition: "box-shadow 0.2s ease-in-out",
              },
            },
          },
        },
      }),
    [mode]
  );

  const value = useMemo(() => ({ mode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeProvider");
  return ctx;
}
