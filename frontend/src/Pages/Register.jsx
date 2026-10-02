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
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const API_URL = import.meta.env.VITE_API_URL;

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
function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

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

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Email is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedEmail)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!role) {
      newErrors.role = "Please select a role";
    } else if (!["User", "Employee"].includes(role)) {
      newErrors.role = "Invalid role selected";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]'/+=;`~]/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character";
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
      const res = await axios.post(`${API_URL}/auth/register`, {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      console.log("Registration response:", res.data);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }
      if (res.data.username) {
        localStorage.setItem("username", res.data.username);
      }
      if (res.data.role) {
        localStorage.setItem("role", res.data.role);
      }
      alert("Registration Successful");
      navigate("/login");
    } catch (err) {
      console.error("Registration Error:", err);
      if (err.response) {
        alert(err.response.data.message || "Registration Failed");
      } else if (err.request) {
        alert("Server is not responding. Please try again.");
      } else {
        alert("Something went wrong. Please try again.");
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
                  Create Account
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Register to get started
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
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearError("email");
                    }}
                    placeholder="Enter email"
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    autoComplete="email"
                    fullWidth
                  />

                  <TextField
                    select
                    label="Select role"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      clearError("role");
                    }}
                    error={Boolean(errors.role)}
                    helperText={errors.role}
                    fullWidth
                  >
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                  </TextField>

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
                    autoComplete="new-password"
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
                    {loading ? "Creating Account..." : "Register"}
                  </Button>
                </Stack>
              </form>

              <Typography
                color="text.secondary"
                sx={{ mt: 3, textAlign: "center" }}
              >
                Already registered?{" "}
                <Link component={RouterLink} to="/login" fontWeight={600}>
                  Sign In
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Register;
