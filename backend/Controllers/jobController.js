const db = require("../config/db");

const JOB_TYPES = [
  "Full Time",
  "Part Time",
  "Internship",
  "Contract",
  "Remote",
];
const EXPERIENCE = ["Fresher", "1-3 years", "3-5 years", "5+ years"];

const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";
const isValidDate = (v) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(new Date(v).getTime());

function validateJob(data) {
  const {
    title,
    company_name,
    description,
    location,
    salary,
    job_type,
    experience,
    skills,
    posted_date,
    deadline,
  } = data;
  const required = {
    title,
    company_name,
    description,
    location,
    salary,
    job_type,
    experience,
    skills,
    posted_date,
    deadline,
  };
  for (const [key, value] of Object.entries(required)) {
    if (isBlank(value)) return `${key} is required`;
  }
  if (title.trim().length < 3 || title.trim().length > 100)
    return "Title must be 3-100 characters";
  if (company_name.trim().length < 2 || company_name.trim().length > 100)
    return "Company name must be 2-100 characters";
  if (location.trim().length < 2 || location.trim().length > 100)
    return "Location must be 2-100 characters";
  if (description.trim().length < 20 || description.trim().length > 5000)
    return "Description must be 20-5000 characters";
  if (!JOB_TYPES.includes(job_type)) return "Invalid job type";
  if (!EXPERIENCE.includes(experience)) return "Invalid experience level";
  if (typeof skills !== "string")
    return "Skills must be a comma separated string";
  const skillList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (skillList.length === 0) return "At least one skill is required";
  if (skillList.length > 20) return "Maximum 20 skills allowed";

  if (isNaN(Number(salary)) || Number(salary) <= 0)
    return "Salary must be a positive number";

  if (!isValidDate(posted_date)) return "Invalid posted date";
  if (!isValidDate(deadline)) return "Invalid deadline";
  if (new Date(deadline) < new Date(posted_date))
    return "Deadline cannot be before the posted date";
  return null;
}

function cleanJobData(body) {
  return {
    title: body.title.trim(),
    company_name: body.company_name.trim(),
    description: body.description.trim(),
    location: body.location.trim(),
    salary: body.salary,
    job_type: body.job_type,
    experience: body.experience,
    skills: body.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", "),
    posted_date: body.posted_date,
    deadline: body.deadline,
  };
}

function checkOwner(req, res, callback) {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

  const jobId = Number(req.params.id);
  if (!Number.isInteger(jobId) || jobId <= 0)
    return res.status(400).json({ message: "Invalid job id" });

  db.query(
    "SELECT id, employer_id FROM jobs WHERE id = ?",
    [jobId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "Job not found" });
      if (rows[0].employer_id !== req.user.id)
        return res.status(403).json({
          message: "You can only modify your own job posts",
        });
      callback(rows[0]);  
    }
  );
}

const getAllJobs = (req, res) => {
  db.query("SELECT * FROM jobs ORDER BY posted_date DESC", (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(result);
  });
};

const getMyJobs = (req, res) => {
  db.query(
    "SELECT * FROM jobs WHERE employer_id = ? ORDER BY posted_date DESC",
    [req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(result);
    },
  );
};

const postJob = (req, res) => {
  if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

  const error = validateJob(req.body);
  if (error) return res.status(400).json({ message: error });

  const job = cleanJobData(req.body);

  db.query(
    `INSERT INTO jobs
     (employer_id, title, company_name, description, location, salary,
      job_type, experience, skills, posted_date, deadline)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      req.user.id,
      job.title,
      job.company_name,
      job.description,
      job.location,
      job.salary,
      job.job_type,
      job.experience,
      job.skills,
      job.posted_date,
      job.deadline,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res
        .status(201)
        .json({ message: "Job created successfully", id: result.insertId });
    },
  );
};

const updateJob = (req, res) => {
  const error = validateJob(req.body);
  if (error) return res.status(400).json({ message: error });

  checkOwner(req, res, (job) => {   
    const jobData = cleanJobData(req.body);
    db.query(
      `UPDATE jobs SET
         title = ?, company_name = ?, description = ?, location = ?,
         salary = ?, job_type = ?, experience = ?, skills = ?,
         posted_date = ?, deadline = ?
       WHERE id = ? AND employer_id = ?`,
      [
        jobData.title,
        jobData.company_name,
        jobData.description,
        jobData.location,
        jobData.salary,
        jobData.job_type,
        jobData.experience,
        jobData.skills,
        jobData.posted_date,
        jobData.deadline,
        job.id,                           
        req.user.id,
      ],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job updated successfully" });
      },
    );
  });
};

const deleteJob = (req, res) => {
  checkOwner(req, res, (job) => {      
    db.query(
      "DELETE FROM jobs WHERE id = ? AND employer_id = ?",
      [job.id, req.user.id],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result.affectedRows === 0)
          return res.status(404).json({ message: "Job not found" });
        res.json({ message: "Job deleted successfully" });
      },
    );
  });
};

module.exports = {
  getMyJobs,
  postJob,
  getAllJobs,
  updateJob,
  deleteJob,
  checkOwner,   
};
