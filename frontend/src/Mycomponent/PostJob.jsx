import * as React from "react";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Remote",
];

const EXPERIENCE = ["Fresher", "1-3 years", "3-5 years", "5+ years"];

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(3),
  ...theme.applyStyles("dark", { backgroundColor: "#1A2027" }),
}));

const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const toDateInput = (d) => {
  if (!d) return "";
  const s = typeof d === "string" ? d.slice(0, 10) : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
};

const formatDate = (d) => {
  const iso = toDateInput(d);
  if (!iso) return "-";
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isExpired = (deadline) => {
  const iso = toDateInput(deadline);
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const deadlineDate = new Date(y, m - 1, d);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return deadlineDate < t;
};

const getInitialForm = () => ({
  title: "",
  company_name: "",
  description: "",
  location: "",
  salary: "",
  job_type: "",
  experience: "",
  skills: "",
  posted_date: today(),
  deadline: "",
});

export default function PostJob() {
  const [formData, setFormData] = useState(getInitialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  const fetchJobs = async () => {
    try {
      setTableLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/job/myjobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load jobs");
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      showSnack(err.message, "error");
      setJobs([]);
    } finally {
      setTableLoading(false);
    }
  };

  // Run once on mount (empty dependency array fixes the infinite loop)
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(jobs.length / rowsPerPage) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [jobs.length, rowsPerPage, page]);

  const validate = () => {
    const errs = {};
    const f = formData;

    if (!f.title.trim()) errs.title = "Job title is required";
    else if (f.title.trim().length < 3 || f.title.trim().length > 100)
      errs.title = "Title must be 3-100 characters";

    if (!f.company_name.trim()) errs.company_name = "Company name is required";
    else if (
      f.company_name.trim().length < 2 ||
      f.company_name.trim().length > 100
    )
      errs.company_name = "Company name must be 2-100 characters";
    if (!f.location.trim()) errs.location = "Location is required";
    else if (f.location.trim().length < 2 || f.location.trim().length > 100)
      errs.location = "Location must be 2-100 characters";

    if (!f.salary || isNaN(Number(f.salary)) || Number(f.salary) <= 0)
      errs.salary = "Enter a valid positive number";

    if (!f.job_type) errs.job_type = "Select a job type";
    if (!f.experience) errs.experience = "Select experience level";

    const skillList = f.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillList.length === 0)
      errs.skills = "Enter at least one skill (comma separated)";
    else if (skillList.length > 20) errs.skills = "Maximum 20 skills allowed";

    if (!f.posted_date) errs.posted_date = "Posted date is required";
    if (!f.deadline) {
      errs.deadline = "Deadline is required";
    } else if (f.posted_date && f.deadline <= f.posted_date) {
      errs.deadline = "Deadline must be after the posted date";
    }

    if (!f.description.trim()) errs.description = "Description is required";
    else if (
      f.description.trim().length < 20 ||
      f.description.trim().length > 5000
    )
      errs.description = "Description must be 20-5000 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const resetForm = () => {
    setFormData(getInitialForm());
    setEditingId(null);
    setErrors({});
  };

  const handleEdit = (job) => {
    setEditingId(job.id);
    setFormData({
      title: job.title ?? "",
      company_name: job.company_name ?? "",
      description: job.description ?? "",
      location: job.location ?? "",
      salary: job.salary != null ? String(Number(job.salary)) : "",
      job_type: job.job_type ?? "",
      experience: job.experience ?? "",
      skills: Array.isArray(job.skills)
        ? job.skills.join(", ")
        : (job.skills ?? ""),
      posted_date: toDateInput(job.posted_date),
      deadline: toDateInput(job.deadline),
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showSnack("You are not logged in. Please log in and try again.", "error");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      company_name: formData.company_name.trim(),
      description: formData.description.trim(),
      location: formData.location.trim(),
      salary: Number(formData.salary),
      job_type: formData.job_type,
      experience: formData.experience,
      skills: formData.skills,
      posted_date: formData.posted_date,
      deadline: formData.deadline,
    };

    const isEditing = editingId !== null;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      setSubmitting(true);
      if (isEditing) {
        await axios.put(`${API_URL}/job/${editingId}`, payload, config);
        showSnack("Job updated successfully!");
      } else {
        await axios.post(`${API_URL}/job/postjob`, payload, config);
        showSnack("Job posted successfully!");
      }
      resetForm();
      fetchJobs();
    } catch (error) {
      showSnack(
        error.response?.data?.message ||
          (isEditing
            ? "Failed to update job. Please try again."
            : "Failed to post job. Please try again."),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showSnack("You are not logged in. Please log in and try again.", "error");
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`${API_URL}/job/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showSnack("Job deleted successfully!");
      if (editingId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      fetchJobs();
    } catch (error) {
      showSnack(
        error.response?.data?.message ||
          "Failed to delete job. Please try again.",
        "error",
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const isEditing = editingId !== null;
  const dateSlotProps = { inputLabel: { shrink: true } };

  const visibleRows =
    rowsPerPage > 0
      ? jobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : jobs;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jobs.length) : 0;

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        p: { xs: 1.5, sm: 2, md: 3 },
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Item sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              sx={{
                mb: { xs: 2, sm: 3 },
                fontWeight: "bold",
                textAlign: "center",
                fontSize: { xs: "1.15rem", sm: "1.5rem" },
              }}
            >
              {isEditing ? "Edit Job" : "Post a Job"}
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="title"
                    name="title"
                    label="Job Title"
                    value={formData.title}
                    onChange={handleChange}
                    error={!!errors.title}
                    helperText={errors.title}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="company_name"
                    name="company_name"
                    label="Company Name"
                    value={formData.company_name}
                    onChange={handleChange}
                    error={!!errors.company_name}
                    helperText={errors.company_name}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="location"
                    name="location"
                    label="Location"
                    value={formData.location}
                    onChange={handleChange}
                    error={!!errors.location}
                    helperText={errors.location}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="salary"
                    name="salary"
                    label="Salary"
                    type="number"
                    value={formData.salary}
                    onChange={handleChange}
                    slotProps={{ htmlInput: { min: 0 } }}
                    error={!!errors.salary}
                    helperText={errors.salary}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" error={!!errors.job_type}>
                    <InputLabel id="job_type-label">Job Type</InputLabel>
                    <Select
                      labelId="job_type-label"
                      id="job_type"
                      name="job_type"
                      value={formData.job_type}
                      label="Job Type"
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Select Job Type</em>
                      </MenuItem>
                      {JOB_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.job_type && (
                      <FormHelperText>{errors.job_type}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    size="small"
                    error={!!errors.experience}
                  >
                    <InputLabel id="experience-label">Experience</InputLabel>
                    <Select
                      labelId="experience-label"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      label="Experience"
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Select Experience</em>
                      </MenuItem>
                      {EXPERIENCE.map((x) => (
                        <MenuItem key={x} value={x}>
                          {x}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.experience && (
                      <FormHelperText>{errors.experience}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    id="skills"
                    name="skills"
                    label="Skills"
                    multiline
                    rows={2}
                    placeholder="React, Node.js, MongoDB"
                    value={formData.skills}
                    onChange={handleChange}
                    error={!!errors.skills}
                    helperText={
                      errors.skills || "Comma separated, up to 20 skills"
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="posted_date"
                    name="posted_date"
                    label="Posted Date"
                    type="date"
                    value={formData.posted_date}
                    onChange={handleChange}
                    slotProps={dateSlotProps}
                    error={!!errors.posted_date}
                    helperText={errors.posted_date}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="deadline"
                    name="deadline"
                    label="Application Deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleChange}
                    slotProps={dateSlotProps}
                    error={!!errors.deadline}
                    helperText={errors.deadline}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="description"
                    name="description"
                    label="Job Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={errors.description}
                  />
                </Grid>

                <Grid size={12}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={submitting}
                      sx={{
                        py: 1.25,
                        fontSize: "0.95rem",
                        fontWeight: "bold",
                      }}
                    >
                      {submitting
                        ? isEditing
                          ? "Updating…"
                          : "Posting…"
                        : isEditing
                          ? "Update Job"
                          : "Post Job"}
                    </Button>
                    {isEditing && (
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled={submitting}
                        onClick={resetForm}
                        sx={{ py: 1.25, fontSize: "0.95rem" }}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Item>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Item sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                textAlign: "center",
                mb: 2,
                fontSize: { xs: "1.15rem", sm: "1.5rem" },
              }}
            >
              Added Jobs
            </Typography>

            <TableContainer
              component={Paper}
              sx={{ maxHeight: 500, overflowY: "auto" }}
            >
              <Table sx={{ minWidth: 540 }} aria-label="jobs table">
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main" }}>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold", width: "3%" }}
                    >
                      Action
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold", width: "30%" }}
                    >
                      Job Description
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold", width: "3%" }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {tableLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  ) : visibleRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        You haven't posted any jobs yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleRows.map((job) => (
                      <TableRow
                        key={job.id}
                        hover
                        selected={job.id === editingId}
                      >
                        <TableCell>
                          {/* alignItems moved into sx to fix the DOM prop warning */}
                          <Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
                            <Button
                              size="small"
                              onClick={() => handleEdit(job)}
                              disabled={submitting}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(job)}
                              disabled={submitting}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, color: "text.secondary" }}
                          >
                            {formatDate(job.posted_date)}
                          </Typography>

                          <Box sx={{ ml: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {job.title + " (" + job.job_type + ")"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              {job.company_name + ", " + job.location}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.secondary" }}
                            >
                              Experience : {job.experience} (Salary :{" "}
                              {job.salary})
                            </Typography>
                          </Box>
                          <Typography sx={{ color: "red" }}>
                            Expires on - {formatDate(job.deadline)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: isExpired(job.deadline)
                                ? "error.main"
                                : "success.main",
                            }}
                          >
                            {isExpired(job.deadline) ? "Expired" : "Active"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}

                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )}
                </TableBody>

                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[
                        5,
                        10,
                        15,
                        { label: "All", value: -1 },
                      ]}
                      colSpan={3}
                      count={jobs.length}
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
          </Item>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
      >
        <DialogTitle>Delete this job?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `"${deleteTarget.title}" will be removed permanently. This cannot be undone.`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}