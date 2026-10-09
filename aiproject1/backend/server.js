import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import playerRoutes from "./routes/playerRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import matchAnalyticsRoutes from "./routes/matchAnalyticsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import playerAnalyticsRoutes from "./routes/playerAnalyticsRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ================================
// API ROUTES
// ================================

app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/predict", predictionRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/match-analytics", matchAnalyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/player-analytics", playerAnalyticsRoutes);
// ================================
// DATABASE
// ================================

connectDB();

// ================================
// HOME
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to SmartCricket AI API 🚀",
  });
});

// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});