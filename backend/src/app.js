import express from "express";
import cors from "cors";
import "dotenv/config"
import connectToDatabase from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth_routes.js";
import activityRoutes from "./routes/activity_routes.js";
import helmet from "helmet";
import logger from "./utils/logger.js";

connectToDatabase().catch((err) => {
  logger.error("Failed to connect to the database", err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);

app.get("/", (req, res) => {
  logger.info("Root route accessed");
  res.send("Carbon Footprint Logger API!");
});

app.use((req, res) => {
  logger.warn("Route not found", { url: req.originalUrl });
  res.status(404).json({ message: "Route Not Found" });
});
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
