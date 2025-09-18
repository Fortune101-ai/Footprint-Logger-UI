import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncRouteWrapper from "#utils/asyncRouteWrapper.js";
import User from "#models/User.js";

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });

const register = asyncRouteWrapper(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email is already in use" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, passwordHash: hashedPassword });
  await user.save();

  const token = sign(user._id);
  res
    .status(201)
    .json({ message: "User registered successfully", userId: user._id, token });
});

const login = asyncRouteWrapper(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = sign(user._id);
  res
    .status(200)
    .json({ message: "Login successful", userId: user._id, token });
});

const getProfile = asyncRouteWrapper(async (req, res) => {
  const user = await User.findById(req.user.id).select("username email");
  res.status(200).json(user);
});

export { register, login, getProfile };
