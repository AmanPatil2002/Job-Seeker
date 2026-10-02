import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_COLOR = {
  Pending: "warning",
  Shortlisted: "success",
  Rejected: "error",
};

const statusColor = (status) => STATUS_COLOR[status] || "default";

const formatDate = (value) => {
  if (!value) return "-";
  const s = typeof value === "string" ? value.slice(0, 10) : value;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return "-";
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function MyApplications() {
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

  return (
    <Box
      sx={{
        minHeight: "80vh",
        py: { xs: 1.5, sm: 3, md: 5 },
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 3, textAlign: "center" }}
      >
        My Applications
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchApplications()}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {!error && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  #
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Job Title
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Company
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Applied On
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography fontWeight={600} gutterBottom>
                      You haven't applied to any jobs yet.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Browse the job listing to find roles that match your
                      skills.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app, index) => (
                  <TableRow key={app.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {app.title || `Job #${app.job_id}`}
                    </TableCell>
                    <TableCell>{app.company_name || "-"}</TableCell>
                    <TableCell>{formatDate(app.applied_at)}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status || "Pending"}
                        color={statusColor(app.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}