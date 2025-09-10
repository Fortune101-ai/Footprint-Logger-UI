const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const asyncRouteWrapper = require('../utils/asyncHandler');
const User = require('../models/User');

const sign = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

const register = asyncRouteWrapper(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash: hashedPassword });
    await user.save();

    const token = sign(user._id);
    res.status(201).json({ message: 'User registered successfully', userId: user._id, token });
});


module.exports = { register };