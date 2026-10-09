import { useState } from "react";
import axios from "axios";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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


function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      newErrors.username = "Username is required";
    } else if (trimmedUsername.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (trimmedUsername.length > 30) {
      newErrors.username = "Username cannot exceed 30 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      newErrors.username =
        "Username can contain only letters, numbers and underscore";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        username: username.trim(),
        password: password,
      });

      console.log("Login response:", res.data);

      if (!res.data.token) {
        alert("Login failed: Token not received");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username || username.trim());
      localStorage.setItem("role", res.data.role || "User");
      localStorage.setItem("Id", res.data.id);
      alert("Login Successful");

      if (res.data.role === "Employee") {
        navigate("/employee/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);

      console.error("Backend response:", err.response?.data);

      if (err.response?.status === 400) {
        alert(err.response?.data?.message || "Please enter valid login details");
      } else if (err.response?.status === 401) {
        alert(err.response?.data?.message || "Invalid username or password");
      } else if (err.response?.status === 404) {
        alert("Login API endpoint not found");
      } else if (err.response?.status === 500) {
        alert("Server error. Please check your backend.");
      } else {
        alert(err.response?.data?.message || "Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

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
          py: { xs: 3, sm: 6 },
        }}
      >
        <Container maxWidth="xs" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h5"
            component="p"
            sx={{ textAlign: "center", color: "primary.main", mb: 2 }}
          >
            Job Seeker
          </Typography>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Typography variant="h4" component="h1">
                  Sign In
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Sign in to your account
                </Typography>
              </Box>

              <form onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.5}>
                  <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearError("username");
                    }}
                    placeholder="Enter username"
                    error={Boolean(errors.username)}
                    helperText={errors.username}
                    autoComplete="username"
                    slotProps={{ htmlInput: { maxLength: 30 } }}
                    fullWidth
                  />

                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    placeholder="Enter password"
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    autoComplete="current-password"
                    fullWidth
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disableElevation
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </Stack>
              </form>

              <Typography
                color="text.secondary"
                sx={{ mt: 3, textAlign: "center" }}
              >
                Don't have an account?{" "}
                <Link component={RouterLink} to="/register" fontWeight={600}>
                  Register
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Login;
