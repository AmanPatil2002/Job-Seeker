
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
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
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
      fontSize: "1.45rem",
      "@media (min-width:600px)": { fontSize: "2.125rem" },
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.15rem",
      "@media (min-width:600px)": { fontSize: "1.5rem" },
    },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderColor: "#E2E6EB" } },
    },
  },
});

const parseLocalDate = (value) => {
  if (!value) return null;
  const s = typeof value === "string" ? value.slice(0, 10) : value;
  const [y, m, d] = s.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
};

const formatDate = (d) => {
  const parsed = parseLocalDate(d);
  return parsed
    ? parsed.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not specified";
};
const toDateInput = (value) => {
  if (!value) return "";
  const s = typeof value === "string" ? value.slice(0, 10) : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
};

const isExpired = (deadline) => {
  const iso = toDateInput(deadline);
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const deadlineDate = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadlineDate < today;
};

const toList = (value) =>
  Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

const getId = (job) => job?._id ?? job?.id;

const uniqueSorted = (arr) =>
  [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b));


function JobListItem({ job, selected, onSelect }) {
  return (
    <Card
      sx={{
        borderColor: selected ? "primary.main" : "divider",
        boxShadow: selected ? "0 0 0 1px #164E63" : "none",
      }}
    >
      <CardActionArea onClick={onSelect} aria-pressed={selected}>
        <CardContent sx={{ p: { xs: 1.75, sm: 2.5 } }}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              overflowWrap: "anywhere",
            }}
          >
            {job.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: "anywhere" }}
          >
            {[job.company_name, job.location].filter(Boolean).join(", ")}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            sx={{ mt: 1.5 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              Posted {formatDate(job.posted_date)}
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function JobDetails({ job, applied, expired, onApply }) {
  if (!job) {
    return (
      <Card>
        <CardContent sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Select a job
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a listing to see the full description and apply.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const skills = toList(job.skills);
  const btnSx = {
    flexShrink: 0,
    alignSelf: { xs: "stretch", sm: "flex-start" },
  };

  const actionButton = applied ? (
    <Button variant="outlined" size="large" color="success" disabled sx={btnSx}>
      Already Applied
    </Button>
  ) : expired ? (
    <Button variant="outlined" size="large" disabled sx={btnSx}>
      Applications Closed
    </Button>
  ) : (
    <Button
      variant="contained"
      size="large"
      disableElevation
      onClick={() => onApply(job)}
      sx={btnSx}
    >
      Apply Now
    </Button>
  );

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ overflowWrap: "anywhere" }}
            >
              {job.title}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ mt: 0.5, overflowWrap: "anywhere" }}
            >
              {job.company_name}, {job.location}
            </Typography>
          </Box>
          {actionButton}
        </Stack>

        <Divider sx={{ my: { xs: 2, md: 3 } }} />
        <Typography variant="h6" component="h3" gutterBottom>
          Job details
        </Typography>
        <Grid container spacing={{ xs: 1.5, md: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Salary
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: "anywhere" }}
              >
                {job.salary || "Not specified"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Job type
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: "anywhere" }}
              >
                {job.job_type || "Not specified"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Experience
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: "anywhere" }}
              >
                {job.experience || "Not specified"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Location
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: "anywhere" }}
              >
                {job.location || "Not specified"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Posted date
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: "anywhere" }}
              >
                {formatDate(job.posted_date) || "Not specified"}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Application deadline
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ overflowWrap: "anywhere" }}
              >
                {job.deadline ? formatDate(job.deadline) : "Not specified"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 2, md: 3 } }} />
        <Typography variant="h6" component="h3" gutterBottom>
          Job description
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            whiteSpace: "pre-line",
            maxWidth: "70ch",
            lineHeight: 1.7,
            overflowWrap: "anywhere",
          }}
        >
          {job.description || "No description has been provided for this job."}
        </Typography>

        {skills.length > 0 && (
          <>
            <Typography variant="h6" component="h3" sx={{ mt: 3, mb: 1.5 }}>
              Skills
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              {skills.map((skill) => (
                <Chip key={skill} label={skill} size="small" />
              ))}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
//-------------------------------------------------------------------Apply Dialog Starts

function ApplyDialog({ open, job, onClose, onSuccess }) {
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setResumeUrl("");
      setCoverLetter("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open, job]);

  const validate = () => {
    const next = {};
    const trimmed = resumeUrl.trim();
    if (!trimmed) next.resumeUrl = "Resume URL is required";
    else if (!/^https?:\/\/\S+\.\S+/.test(trimmed))
      next.resumeUrl = "Enter a valid http(s) resume link";
    if (!coverLetter.trim()) next.coverLetter = "Cover letter is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/application/postappl/${getId(job)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_url: resumeUrl.trim(),
          cover_letter: coverLetter.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Failed to submit application");

      onSuccess?.(data.message || "Application submitted successfully");
      onClose();
    } catch (err) {
      if (/already applied/i.test(err.message)) {
        setErrors({ resumeUrl: "You have already applied for this job." });
      } else {
        setErrors({ submit: err.message || "Something went wrong" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={false}
    >
      <DialogTitle sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
        Apply for {job?.title || "this job"}
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText sx={{ mb: 2 }}>
          {job?.company_name ? `${job.company_name} • ` : ""}
          {job?.location || ""}
        </DialogContentText>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Resume URL"
            placeholder="https://drive.google.com/..."
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            error={!!errors.resumeUrl}
            helperText={
              errors.resumeUrl ||
              "Link to your resume (Google Drive, Dropbox, etc.)"
            }
            fullWidth
            autoFocus
            disabled={submitting}
          />
          <TextField
            label="Cover letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            error={!!errors.coverLetter}
            helperText={
              errors.coverLetter || "Tell the employer why you're a good fit"
            }
            fullWidth
            multiline
            minRows={4}
            disabled={submitting}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
//-------------------------------------------------------------------Apply Dialog Ends

function HomeContent() {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const isMobile = useMediaQuery((t) => t.breakpoints.down("md"));

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());
  const [applyJob, setApplyJob] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    const loadData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/job/alljobs`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
          fetch(`${API_URL}/application/myappl`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }),
        ]);

        const jobsData = await jobsRes.json().catch(() => null);
        const appsData = await appsRes.json().catch(() => null);

        if (!jobsRes.ok)
          throw new Error(jobsData?.message || "Failed to load jobs");
        if (!appsRes.ok)
          console.warn("Could not load my applications:", appsData?.message);

        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setAppliedJobIds(
          new Set(
            (Array.isArray(appsData) ? appsData : [])
              .map((a) => a.job_id)
              .filter((id) => id != null),
          ),
        );
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadData();

    return () => controller.abort();
  }, []);

  const jobTypes = uniqueSorted(jobs.map((j) => j.job_type));
  const experiences = uniqueSorted(jobs.map((j) => j.experience));
  const filtersActive = Boolean(query.trim() || jobType || experience);

  const q = query.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    if (q) {
      const haystack = [job.title, job.company_name, job.location]
        .filter(Boolean)
        .map((s) => s.toLowerCase());
      if (!haystack.some((s) => s.includes(q))) return false;
    }
    if (jobType && job.job_type !== jobType) return false;
    if (experience && job.experience !== experience) return false;
    return true;
  });

  const selectedJob = isMobile
    ? (filteredJobs.find((j) => getId(j) === selectedId) ?? null)
    : (filteredJobs.find((j) => getId(j) === selectedId) ??
      filteredJobs[0] ??
      null);

  const showMobileDetails = isMobile && !loading && selectedJob !== null;
  const showList = !showMobileDetails;
  const showDetails = !isMobile || showMobileDetails;

  const openJob = (job) => {
    setSelectedId(getId(job));
    if (isMobile) window.scrollTo({ top: 0 });
  };

  const backToList = () => setSelectedId(null);
  const clearFilters = () => {
    setQuery("");
    setJobType("");
    setExperience("");
  };

  const handleApplySuccess = (message) => {
    const id = applyJob ? getId(applyJob) : null;
    if (id != null) {
      setAppliedJobIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    setToast({
      open: true,
      message: message || "Application submitted successfully",
      severity: "success",
    });
  };

  const selectedApplied = selectedJob
    ? appliedJobIds.has(getId(selectedJob))
    : false;
  const selectedExpired = selectedJob ? isExpired(selectedJob.deadline) : false;

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100dvh",
          bgcolor: "background.default",
          py: { xs: 1.5, sm: 3, md: 5 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 } }}>
          {showList && (
            <Box sx={{ mb: { xs: 2, sm: 2.5, md: 4 } }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{ textAlign: "center" }}
              >
                Job Seeker
              </Typography>
              {role === "User" && (
                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    textAlign: "center",
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  }}
                >
                  Welcome back, {username}
                </Typography>
              )}

              <Grid
                container
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{ mt: { xs: 1.5, sm: 2, md: 3 } }}
              >
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    id="job-search"
                    label="Search by title or company"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ bgcolor: "background.paper" }}
                  />
                </Grid>
                <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Job type"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    sx={{ bgcolor: "background.paper" }}
                  >
                    <MenuItem value="">All types</MenuItem>
                    {jobTypes.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    sx={{ bgcolor: "background.paper" }}
                  >
                    <MenuItem value="">All levels</MenuItem>
                    {experiences.map((e) => (
                      <MenuItem key={e} value={e}>
                        {e}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                {filtersActive && (
                  <Grid size={{ xs: 4, sm: 4, md: 4 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={clearFilters}
                      sx={{
                        height: { xs: 40, md: 40 },
                        justifyContent: "center",
                      }}
                    >
                      Clear filters
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {showMobileDetails && (
            <Button onClick={backToList} sx={{ mb: 2 }}>
              ← Back to jobs
            </Button>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
            {showList && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5 }}
                >
                  {loading
                    ? "Loading jobs"
                    : `${filteredJobs.length} ${filteredJobs.length === 1 ? "job" : "jobs"}${filtersActive ? " match your search" : ""}`}
                </Typography>

                <Stack spacing={1.5}>
                  {loading &&
                    [0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} variant="rounded" height={104} />
                    ))}

                  {!loading && filteredJobs.length === 0 && !error && (
                    <Card>
                      <CardContent sx={{ textAlign: "center", py: 5 }}>
                        <Typography fontWeight={600} gutterBottom>
                          No jobs found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {filtersActive
                            ? "Try clearing filters or changing your search."
                            : "Check back later for new openings."}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {filteredJobs.map((job) => (
                    <JobListItem
                      key={getId(job)}
                      job={job}
                      selected={!isMobile && getId(job) === getId(selectedJob)}
                      onSelect={() => openJob(job)}
                    />
                  ))}
                </Stack>
              </Grid>
            )}

            {showDetails && (
              <Grid
                size={{ xs: 12, md: 7 }}
                sx={{
                  position: { md: "sticky" },
                  top: { md: 24 },
                  maxHeight: { md: "calc(100dvh - 48px)" },
                  overflowY: { md: "auto" },
                }}
              >
                {loading ? (
                  <Skeleton variant="rounded" height={isMobile ? 320 : 420} />
                ) : (
                  <JobDetails
                    job={selectedJob}
                    applied={selectedApplied}
                    expired={selectedExpired}
                    onApply={setApplyJob}
                  />
                )}
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <ApplyDialog
        open={!!applyJob}
        job={applyJob}
        onClose={() => setApplyJob(null)}
        onSuccess={handleApplySuccess}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <HomeContent />
    </ThemeProvider>
  );
}
