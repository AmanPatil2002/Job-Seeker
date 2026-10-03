import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  Skeleton,
  Stack,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authFetch = async (path, signal) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || "Failed to load dashboard");
  return data;
};

const dayString = (d) => {
  if (!d) return "";
  const s = typeof d === "string" ? d.slice(0, 10) : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
};

export default function Dashboard() {
  const username = localStorage.getItem("username");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const load = async (signal) => {
  setLoading(true);
  setError("");
  try {
    const jobsData = await authFetch("/job/alljobs", signal);
    const appsData = await authFetch("/application/allappl", signal);

    if (signal?.aborted) return;
    setJobs(Array.isArray(jobsData) ? jobsData : []);
    setApplications(Array.isArray(appsData) ? appsData : []);
  } catch (err) {
    if (err.name === "AbortError") return;
    setError(err.message);
    setJobs([]);
    setApplications([]);
  } finally {
    if (!signal?.aborted) setLoading(false);
  }
};

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const today = dayString(new Date());
  const countStatus = (s) => applications.filter((a) => a.status === s).length;

  const stats = [
    { title: "Total Jobs Posted", value: jobs.length },
    {
      title: "Active Jobs",
      value: jobs.filter((j) => j.deadline && dayString(j.deadline) >= today)
        .length,
    },
    { title: "Total Applications", value: applications.length },
    {
      title: "Pending Applications",
      value: countStatus("Pending"),
      sx: { color: "orange" },
    },
    {
      title: "Shortlisted Applications",
      value: countStatus("Shortlisted"),
      sx: { color: "green" },
    },
    {
      title: "Rejected Applications",
      value: countStatus("Rejected"),
      sx: { color: "red" },
    },
  ];

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{
          fontSize: { xs: "1.5rem", sm: "2.125rem" },
          overflowWrap: "anywhere",
        }}
      >
        Welcome back, {username}!
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => load()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {(loading ? Array.from({ length: 6 }) : stats).map((stat, i) => (
          <Grid
            key={stat?.title ?? i}
            size={{ xs: 12, sm: 6, lg: 4 }}
            sx={{ display: "flex" }}
          >
            <Card
              sx={{
                width: "100%",
                minHeight: { xs: 110, sm: 150 },
                borderRadius: 3,
                boxShadow: 2,
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                {loading ? (
                  <Stack sx={{ width: "100%" }}>
                    <Skeleton width="60%" />
                    <Skeleton variant="text" width="30%" height={48} />
                  </Stack>
                ) : (
                  <Stack>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      sx={{ textAlign: "center", ...(stat.sx || {}) }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ mt: 1, ...(stat.sx || {}) }}
                    >
                      {error ? "-" : stat.value}
                    </Typography>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}