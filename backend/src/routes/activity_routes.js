const express = require('express');
const router = express.Router();

const {addActivity, getUserActivities, deleteActivity, getSummary} = require('../controllers/activity_controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, addActivity);
router.get('/', authMiddleware, getUserActivities);
router.delete('/:id', authMiddleware, deleteActivity);
router.get('/summary', authMiddleware, getSummary);

module.exports = router;