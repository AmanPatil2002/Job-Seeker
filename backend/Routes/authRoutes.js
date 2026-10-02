const express = require("express");
const router = express.Router();

const { getAuth, postAuth, checkLogin, getMe } = require("../Controllers/authController");
const authenticateToken = require("../Middleware/Authenticate");

router.get("/register", authenticateToken, getAuth);
router.post("/register", postAuth);
router.post("/login", checkLogin);
router.get("/me", authenticateToken, getMe);

module.exports = router;