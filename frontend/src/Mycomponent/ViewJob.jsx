import { useState, useEffect } from "react";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Divider from "@mui/material/Divider";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const HEADERS = ["Employer", "Job details"];

const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Remote",
];
const EXPERIENCE = ["Fresher", "1-3 years", "3-5 years", "5+ years"];

const isToday = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === today();
};

const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

function filterJobs(jobs, query, jobType, experience) {
  const q = query.trim().toLowerCase();
  return jobs.filter((job) => {
    if (jobType && job.job_type !== jobType) return false;
    if (experience && job.experience !== experience) return false;
    if (!q) return true;
    return [job.title, job.company_name, job.location, job.skills].some(
      (field) => field?.toLowerCase().includes(q),
    );
  });
}

const stackOnMobile = { display: { xs: "block", sm: "table-cell" } };

export default function ViewJob() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [query, setQuery] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/job/alljobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load jobs");
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtersActive = Boolean(query.trim() || jobType || experience);

  const filteredJobs = filterJobs(jobs, query, jobType, experience);

  const updateFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(0);
  };

  const clearFilters = () => {
    setQuery("");
    setJobType("");
    setExperience("");
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredJobs.length) : 0;

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const visibleRows =
    rowsPerPage > 0
      ? filteredJobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : filteredJobs;

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ textAlign: "center", mb: 2 }}
      >
        View Jobs
      </Typography>

      {error && (
        <Alert id="error" sx={{ mb: 2 }}>
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
          label="Search by title, company, location or skill"
          value={query}
          onChange={updateFilter(setQuery)}
          sx={{ flex: 2, bgcolor: "background.paper" }}
        />
        <TextField
          select
          size="small"
          label="Job type"
          value={jobType}
          onChange={updateFilter(setJobType)}
          sx={{ flex: 1, minWidth: 80, bgcolor: "background.paper" }}
        >
          <MenuItem value="">All types</MenuItem>
          {JOB_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Experience"
          value={experience}
          onChange={updateFilter(setExperience)}
          sx={{ flex: 1, minWidth: 80, bgcolor: "background.paper" }}
        >
          <MenuItem value="">Any experience</MenuItem>
          {EXPERIENCE.map((x) => (
            <MenuItem key={x} value={x}>
              {x}
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
          {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
          {filtersActive ? " match your search" : ""}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table aria-label="jobs table">
          <TableHead sx={{ display: { xs: "none", sm: "table-header-group" } }}>
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
                    ? "No jobs match your search or filters"
                    : "No jobs found"}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((job) => (
                <TableRow
                  key={job.id}
                  hover
                  sx={{ display: { xs: "block", sm: "table-row" } }}
                >
                  <TableCell
                    sx={{
                      ...stackOnMobile,
                      width: { sm: 200 },
                      verticalAlign: "top",
                      borderBottom: { xs: "none", sm: 1 },
                      borderColor: "divider",
                      pb: { xs: 0, sm: 2 },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-line",
                          lineHeight: 1.6,
                          overflowWrap: "anywhere",
                        }}
                      >
                        Employee ID : {job.employer_id}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-line",
                          lineHeight: 1.6,
                          overflowWrap: "anywhere",
                        }}
                      >
                        Posted : {formatDate(job.posted_date)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "pre-line",
                          color: isToday(job.deadline)
                            ? "red"
                            : "text.secondary",
                          lineHeight: 1.6,
                          overflowWrap: "anywhere",
                        }}
                      >
                        Deadline: {formatDate(job.deadline)}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ ...stackOnMobile, verticalAlign: "top" }}>
                    <Stack spacing={2}>
                      <Box>
                        <Stack
                          direction="column"
                          spacing={1}
                          sx={{
                            gridColumn: {
                              xs: "span 1",
                              sm: "span 1",
                              md: "span 2",
                            },
                          }}
                        >
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ overflowWrap: "anywhere" }}
                          >
                            {job.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ overflowWrap: "anywhere" }}
                          >
                            {job.company_name}, {job.location}
                          </Typography>
                        </Stack>
                      </Box>

                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`${job.id}-panel1-content`}
                          id={`${job.id}-panel1-header`}
                        >
                          <Typography
                            component="span"
                            sx={{ bgcolor: "background.paper" }}
                          >
                            Job Description
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{ overflowWrap: "anywhere" }}
                            >
                              {job.title}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              sx={{ overflowWrap: "anywhere" }}
                            >
                              {job.company_name}, {job.location}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
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
                              <b>Description :</b>{" "}
                              {job.description ||
                                "No description has been provided for this job."}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography
                              variant="subtitle2"
                              sx={{ overflowWrap: "anywhere" }}
                            >
                              <b>Skills Required :</b> {job.skills}
                            </Typography>
                            <Box
                              sx={{
                                mt: 1,
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "1fr 1fr",
                                  md: "repeat(3, 1fr)",
                                },
                                gap: 2,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-line",
                                  lineHeight: 1.6,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                <b>Experience :</b> {job.experience}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-line",
                                  lineHeight: 1.6,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                <b>Salary :</b>{" "}
                                {job.salary
                                  ? `${Number(job.salary).toLocaleString()} ₹/- per month`
                                  : null}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "pre-line",
                                  lineHeight: 1.6,
                                  overflowWrap: "anywhere",
                                }}
                              >
                                <b>Job type :</b> {job.job_type}
                              </Typography>
                            </Box>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}

            {emptyRows > 0 && (
              <TableRow
                sx={{ display: { xs: "none", sm: "table-row" } }}
                style={{ height: 53 * emptyRows }}
              >
                <TableCell colSpan={HEADERS.length} />
              </TableRow>
            )}
          </TableBody>

          <TableFooter
            sx={{ display: { xs: "block", sm: "table-footer-group" } }}
          >
            <TableRow sx={{ display: { xs: "block", sm: "table-row" } }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={HEADERS.length}
                count={filteredJobs.length}
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
                sx={{ display: { xs: "block", sm: "table-cell" } }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
}
