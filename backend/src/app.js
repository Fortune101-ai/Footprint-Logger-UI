const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectToDatabase = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/auth_routes");
const activityRoutes = require("./routes/activity_routes");
const helmet = require("helmet");

connectToDatabase().catch((err) => {
  console.error("Failed to connect to the database", err);
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
  res.send("Carbon Footprint Logger API!");
});

app.use((req, res) => res.status(404).json({ message: "Route Not Found" }));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
