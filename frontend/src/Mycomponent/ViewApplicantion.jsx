import { useState, useEffect, useCallback } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HEADERS = [
  "Applied",
  "Applicant",
  "Cover letter & Resume",
  "Status",
  "Actions",
];

const STATUSES = ["Pending", "Shortlisted", "Rejected"];

const STATUS_COLOR = {
  Pending: "warning",
  Shortlisted: "success",
  Rejected: "error",
};

const formatDate = (d) => {
  if (!d) return "-";
  const dateOnly = typeof d === "string" ? d.slice(0, 10) : d;
  const parsed = new Date(dateOnly);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isSafeUrl = (url) => /^https?:\/\//i.test(url || ""); // ---------------chatgpt

function option(applications) {
  const seen = new Map();
  applications.forEach((a) => {
    if (!seen.has(a.job_id))
      seen.set(a.job_id, a.job_title || `Job #${a.job_id}`);
  });
  return [...seen.entries()].map(([id, title]) => ({ id, title }));
}

function filterApplications(applications, query, status, jobId) {
  const q = query.trim().toLowerCase();
  return applications.filter((a) => {
    if (status && a.status !== status) return false;
    if (jobId && String(a.job_id) !== jobId) return false;
    if (!q) return true;
    return [a.username, a.email, a.job_title, a.company_name].some(
      (field) => typeof field === "string" && field.toLowerCase().includes(q),
    );
  });
}

export default function ViewApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");

  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchApplications = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/application/allappl`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to load applications");
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Failed to load applications");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchApplications(controller.signal);
    return () => controller.abort();
  }, [fetchApplications]);

  const jobOptions = option(applications);

  const filtersActive = Boolean(query.trim() || status || jobId);

  const filteredApplications = filterApplications(
    applications,
    query,
    status,
    jobId,
  );

  const updateFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setQuery("");
    setStatus("");
    setJobId("");
    setPage(0);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    const previous = applications;
    setApplications((prev) =>
      prev.map((a) =>
        a.id === applicationId ? { ...a, status: newStatus } : a,
      ),
    );
    setUpdatingId(applicationId);
    setToast({ open: false, message: "", severity: "success" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/application/editappl/${applicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }), 
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setToast({
        open: true,
        message: "Status updated successfully",
        severity: "success",
      });
    } catch (err) {
      setApplications(previous);
      setToast({
        open: true,
        message: err.message || "Failed to update status",
        severity: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredApplications.length)
      : 0;

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows =
    rowsPerPage > 0
      ? filteredApplications.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage,
        )
      : filteredApplications;

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ textAlign: "center", mb: 2 }}
      >
        View Applications
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

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <TextField
          size="small"
          label="Search by applicant, email, job or company"
          value={query}
          onChange={updateFilter(setQuery)}
          sx={{ flex: 2, bgcolor: "background.paper" }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={updateFilter(setStatus)}
          sx={{ flex: 1, minWidth: 150, bgcolor: "background.paper" }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Job"
          value={jobId}
          onChange={updateFilter(setJobId)}
          sx={{ flex: 1, minWidth: 150, bgcolor: "background.paper" }}
        >
          <MenuItem value="">All jobs</MenuItem>
          {jobOptions.map((j) => (
            <MenuItem key={j.id} value={String(j.id)}>
              {j.title}
            </MenuItem>
          ))}
        </TextField>
        {filtersActive && (
          <Button onClick={clearFilters} sx={{ flexShrink: 0 }}>
            Clear
          </Button>
        )}
      </Stack>

      {!loading && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {filteredApplications.length}{" "}
          {filteredApplications.length === 1 ? "application" : "applications"}
          {filtersActive ? " match your search" : ""}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 900 }} aria-label="applications table">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {HEADERS.map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={HEADERS.length}
                  align="center"
                  sx={{ py: 5 }}
                >
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={HEADERS.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  {filtersActive
                    ? "No applications match your search or filters"
                    : "No applications found"}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell
                    sx={{ verticalAlign: "top", whiteSpace: "nowrap" }}
                  >
                    {formatDate(app.applied_at)}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: "top" }}>
                    <Typography variant="body2" fontWeight={600}>
                      <b>Applicant : </b>
                      {app.username}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      <b>Applied For: </b>
                      {app.job_title || `Job #${app.job_id}`}
                    </Typography>
                    {app.company_name && (
                      <Typography variant="body2" color="text.secondary">
                        <b>Company: </b>
                        {app.company_name}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ verticalAlign: "top", maxWidth: 280 }}>
                    <Tooltip title={app.cover_letter || ""} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-line",
                          overflowWrap: "anywhere",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {app.cover_letter}
                      </Typography>
                    </Tooltip>
                    {isSafeUrl(app.resume_url) ? (
                      <Link
                        href={app.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        fontWeight={600}
                      >
                        View resume
                      </Link>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: "top", minWidth: 170 }}>
                    <Chip
                      label={app.status}
                      size="small"
                      color={STATUS_COLOR[app.status] || "default"}
                    />
                  </TableCell>

                  <TableCell sx={{ verticalAlign: "top", minWidth: 170 }}>
                    <TextField
                      select
                      size="small"
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) =>
                        handleStatusChange(app.id, e.target.value)
                      }
                      sx={{ minWidth: 130, bgcolor: "background.paper" }}
                      inputProps={{ "aria-label": "Change status" }}
                    >
                      {STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </TextField>
                    {updatingId === app.id && <CircularProgress size={18} />}
                  </TableCell>
                </TableRow>
              ))
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={HEADERS.length} />
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={HEADERS.length}
                count={filteredApplications.length}
                rowsPerPage={rowsPerPage}
                page={page}
                slotProps={{
                  select: {
                    inputProps: { "aria-label": "rows per page" },
                    native: true,
                  },
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
