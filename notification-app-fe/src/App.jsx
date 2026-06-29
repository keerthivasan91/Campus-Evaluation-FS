import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

import { NotificationsPage } from "./pages/NotificationsPage";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
    },
    secondary: {
      main: "#c2410c",
    },
    background: {
      default: "#f4efe8",
      paper: "rgba(255, 253, 248, 0.96)",
    },
    text: {
      primary: "#10212a",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"Trebuchet MS", "Gill Sans", "Lucida Grande", sans-serif',
    h3: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 700,
    },
    h5: {
      fontFamily: '"Georgia", "Times New Roman", serif',
      fontWeight: 700,
    },
    button: {
      fontWeight: 700,
      letterSpacing: 0.2,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(16, 33, 42, 0.08)",
          boxShadow: "0 18px 45px rgba(16, 33, 42, 0.08)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationsPage />
    </ThemeProvider>
  );
}