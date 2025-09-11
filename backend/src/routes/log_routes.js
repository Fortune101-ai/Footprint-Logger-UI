const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const {
  createLog,
  getUserLogs,
  getAverageEmission,
  getLeaderboard,
} = require("../controllers/log_controller");

router.post("/", authenticateToken, createLog);
router.get("/user", authenticateToken, getUserLogs);
router.get("/average", authenticateToken, getAverageEmission);
router.get("/leaderboard",authenticateToken, getLeaderboard);
router.get("/summary", authenticateToken, getUserSummary);

module.exports = router;
