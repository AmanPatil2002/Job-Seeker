import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#164E63" },
    background: { default: "#F4F6F8", paper: "#FFFFFF" },
    text: { primary: "#1B2430", secondary: "#5B6675" },
    divider: "#E2E6EB",
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});

const points = [
  {
    title: "Browse openings",
    text: "See the latest jobs with salary, location and experience up front.",
  },
  {
    title: "Search quickly",
    text: "Filter by job title, company or location to find what fits.",
  },
  {
    title: "Read before you apply",
    text: "Open any listing for the full description, skills and deadline.",
  },
];

export default function Site() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          "@supports (height: 100dvh)": { minHeight: "100dvh" },
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          py: { xs: 4, md: 8 },
          "@media (max-height:500px) and (orientation: landscape)": { py: 3 },
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 3 } }}>
          <Typography
            component="h1"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              fontSize: "clamp(2.25rem, 8vw, 4.25rem)",
              overflowWrap: "anywhere",
              color: "primary.main",
            }}
          >
            Job Seeker
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 2.5,
              maxWidth: "52ch",
              fontSize: { xs: "1.05rem", md: "1.25rem" },
              lineHeight: 1.6,
            }}
          >
            Job Seeker brings job openings from different companies into one
            place. Search the listings, read the details, and find your next
            role without the clutter.
          </Typography>

          <Button
            variant="contained"
            size="large"
            disableElevation
            onClick={() => navigate("/login")}
            sx={{
              mt: 4,
              px: 5,
              py: 1.4,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Log in
          </Button>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: { xs: 3, md: 5 },
              mt: { xs: 5, md: 9 },
              pt: { xs: 4, md: 5 },
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {points.map((p) => (
              <Box key={p.title} sx={{ minWidth: 0, maxWidth: { xs: "60ch", md: "none" } }}>
                <Typography variant="h6" component="h2" fontWeight={600} gutterBottom>
                  {p.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {p.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}