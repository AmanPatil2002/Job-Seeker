const express = require("express");
const router = express.Router();
const {
  postApplication,
  getMyApplications,
  getAllMyJobApplications,
  getJobApplications,
  putApplicationStatus,
} = require("../Controllers/applicationController");

const authenticateToken = require("../Middleware/Authenticate");

router.post("/postappl/:id", authenticateToken, postApplication);     
router.get ("/myappl",       authenticateToken, getMyApplications);            
router.get ("/allappl",      authenticateToken, getAllMyJobApplications); 
router.get ("/allappl/:id",  authenticateToken, getJobApplications);   
router.put ("/editappl/:id", authenticateToken, putApplicationStatus);   

module.exports = router;