const db = require("../config/db");
const { checkOwner } = require("./jobController");

const STATUSES = ["Pending", "Shortlisted", "Rejected"];

const postApplication = (req, res) => {
  const jobId = req.params.id;
  const { resume_url, cover_letter } = req.body;

  if (!resume_url || !resume_url.trim()) {
    return res.status(400).json({ message: "Resume URL is required" });
  }
  if (!/^https?:\/\/\S+\.\S+/.test(resume_url)) {
    return res.status(400).json({ message: "Enter a valid resume link" });
  }
  if (!cover_letter || !cover_letter.trim()) {
    return res.status(400).json({ message: "Cover letter is required" });
  }

  db.query(
    "SELECT id, (deadline < CURDATE()) AS expired FROM jobs WHERE id=?",
    [jobId],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      if (result.length === 0) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (result[0].expired) {
        return res
          .status(400)
          .json({ message: "The application deadline has passed" });
      }

      db.query(
        `INSERT INTO applications(job_id, user_id, resume_url, cover_letter)
         VALUES(?,?,?,?)`,
        [jobId, req.user.id, resume_url.trim(), cover_letter.trim()],
        (err) => {
          if (err) {
            if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(409)
                .json({ message: "You have already applied for this job." });
            }
            return res.status(500).json({ message: err.message });
          }
          return res
            .status(201)
            .json({ message: "Application submitted successfully" });
        }
      );
    }
  );
};

const getMyApplications = (req, res) => {
  const sql = `
    SELECT a.id, a.status, a.applied_at,
           j.id AS job_id, j.title, j.company_name,
           j.location, j.job_type
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.user_id = ?
    ORDER BY a.id DESC`;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    return res.json(result);
  });
};

const getAllMyJobApplications = (req, res) => {
  const sql = `
    SELECT a.id, a.job_id, a.user_id, a.resume_url, a.cover_letter,
           a.status, a.applied_at,
           j.title AS job_title, j.company_name,
           l.username, l.email
    FROM applications a
    JOIN jobs j   ON j.id = a.job_id
    JOIN login l  ON l.id = a.user_id
    WHERE j.employer_id = ?
    ORDER BY a.id DESC`;

  db.query(sql, [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    return res.json(result);
  });
};


const getJobApplications = (req, res) => {
  checkOwner(req, res, (job) => {
    const sql = `
      SELECT a.*, l.username AS applicant_name, l.email AS applicant_email
      FROM applications a
      JOIN login l ON l.id = a.user_id
      WHERE a.job_id = ?
      ORDER BY a.id DESC`;

    db.query(sql, [job.id], (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      return res.json({ job, applications: result });
    });
  });
};

const putApplicationStatus = (req, res) => {
  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ message: "Invalid status. Must be Pending, Shortlisted or Rejected." });
  }

  db.query(
    `SELECT a.id, j.employer_id
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE a.id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });

      if (result.length === 0) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (result[0].employer_id !== req.user.id) {
        return res.status(403).json({
          message: "You can only manage applications for your own jobs",
        });
      }

      db.query(
        "UPDATE applications SET status=? WHERE id=?",
        [status, req.params.id],
        (err) => {
          if (err) return res.status(500).json({ message: err.message });
          return res.json({ message: "Status updated successfully", status });
        }
      );
    }
  );
};

module.exports = {
  postApplication,
  getMyApplications,
  getAllMyJobApplications,
  getJobApplications,
  putApplicationStatus,
};