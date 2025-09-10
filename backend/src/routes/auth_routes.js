const express = require('express');
const { register, login, getProfile } = require('../controllers/auth_controller');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;