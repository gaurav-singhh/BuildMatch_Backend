import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import contractorRoutes from "./routes/contractorRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import jobRequetRoutes from "./routes/jobRequetRoutes.js";
dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allow frontend to send credentials (cookies)
app.use(
  cors({
    origin: true, // allows any origin
    credentials: true, // allows cookies to be sent
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/projects/:projectId/bids", bidRoutes);
app.use("/api/contractor-profile", contractorRoutes);
app.use("/api/user-profile", userRoutes);
app.use("/api/job-request",jobRequetRoutes)
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
