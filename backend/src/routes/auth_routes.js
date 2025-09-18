import express from "express";
import {
  register,
  login,
  getProfile,
} from "../controllers/auth_controller.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);

export default router;
