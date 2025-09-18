import express from 'express';
const router = express.Router();

import {
  addActivity,
  getUserActivities,
  getActivityOptions,
  deleteActivity,
  getSummary,
  getUserSummary,
  getUserStreak,
  getPersonalizedAnalysis,
} from '#controllers/activity.controller.js';
import authMiddleware from '#middleware/auth.middleware.js';

router.post('/', authMiddleware, addActivity);
router.get('/', authMiddleware, getUserActivities);
router.get('/options', authMiddleware, getActivityOptions);
router.delete('/:id', authMiddleware, deleteActivity);
router.get('/summary', authMiddleware, getUserSummary);
router.get('/leaderboard', authMiddleware, getSummary);
router.get('/streak', authMiddleware, getUserStreak);
router.get('/analysis', authMiddleware, getPersonalizedAnalysis);

export default router;
