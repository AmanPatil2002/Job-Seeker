import { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import WorkIcon from "@mui/icons-material/Work";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Account() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async (signal) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/application/myappl`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load applications");
      }
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load applications");
      setApplications([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Unable to load account information.",
      );
    } finally {
      setLoading(false);
    }
  };

  const totalApplications = applications.length;

  const pendingCount = applications.filter(
    (app) =>
      app.status?.toLowerCase() === "pending" ||
      !app.status, 
  ).length;

  const shortlistedCount = applications.filter(
    (app) =>
      app.status?.toLowerCase() === "shortlisted"
  ).length;

  const rejectedCount = applications.filter(
    (app) =>
      app.status?.toLowerCase() === "rejected" 
  ).length;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 6 },
      }}
    >
      <Container maxWidth="md">
        <Card
          elevation={4}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #1976d2, #42a5f5)",
              py: 2,
              textAlign: "center",
              color: "white",
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                margin: "0 auto 15px",
                bgcolor: "white",
                color: "#1976d2",
                fontSize: 45,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || <PersonIcon />}
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              {user?.role || "Not available"}
            </Typography>
          </Box>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ textAlign: "center" }}
            >
              Profile Information
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Your current profile details
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <PersonIcon color="primary" />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Username
                      </Typography>

                      <Typography variant="h6" fontWeight="600">
                        {user?.username || "Not available"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <EmailIcon color="primary" />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>

                      <Typography
                        variant="h6"
                        fontWeight="600"
                        sx={{
                          wordBreak: "break-word",
                        }}
                      >
                        {user?.email || "Not available"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <WorkIcon color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h6" color="text.secondary">
                      Total Applied Jobs
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {totalApplications}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#fff8e1",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#f57c00">
                    {pendingCount}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#e8f5e9",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Shortlisted
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                    {shortlistedCount}
                  </Typography>
                </Box>
              </Grid>

              
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#ffebee",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="#c62828">
                    {rejectedCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}