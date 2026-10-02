const express = require("express");
const router = express.Router();
const {
  getMyJobs,
  postJob,
  getAllJobs,
  updateJob,
  deleteJob,
} = require("../Controllers/jobController");

const authenticateToken = require("../Middleware/Authenticate");

router.post("/postjob", authenticateToken, postJob);
router.get("/myjobs", authenticateToken, getMyJobs);
router.get("/alljobs", authenticateToken, getAllJobs);
router.put("/:id", authenticateToken, updateJob);
router.delete("/:id", authenticateToken, deleteJob);

module.exports = router;