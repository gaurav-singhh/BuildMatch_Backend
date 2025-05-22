import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  sendJobRequest,
  getJobRequestsForContractor,
  respondToJobRequest,
  sendDirectJobRequest,
} from "../controllers/jobRequestController.js";

const router = express.Router();

// Customer sends job request to contractor
router.post("/send", authenticate, sendJobRequest);
router.post("/direct-send", authenticate, sendDirectJobRequest);
// Contractor views their job requests
router.get("/my-requests", authenticate, getJobRequestsForContractor);

// Contractor accepts/rejects a job request
router.patch("/:requestId/respond", authenticate, respondToJobRequest);

export default router;
