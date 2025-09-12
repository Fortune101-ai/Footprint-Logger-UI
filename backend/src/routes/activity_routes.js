const express = require("express");
const router = express.Router();

const {
  addActivity,
  getUserActivities,
  getActivityOptions,
  deleteActivity,
  getSummary,
  getUserSummary,
  getUserStreak,
} = require("../controllers/activity_controller");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, addActivity);
router.get("/", authMiddleware, getUserActivities);
router.get("/options", authMiddleware, getActivityOptions);
router.delete("/:id", authMiddleware, deleteActivity);
router.get("/summary", authMiddleware, getUserSummary);
router.get("/leaderboard", authMiddleware, getSummary);
router.get("/streak", authMiddleware, getUserStreak);

module.exports = router;
