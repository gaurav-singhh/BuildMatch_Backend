import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  searchContractors,
  updateContractorProfile,
  listAllContractors,
} from "../controllers/contractorController.js";

const router = express.Router();

router.patch("/update", authenticate, updateContractorProfile);
router.get("/", authenticate, listAllContractors);
router.get("/search", authenticate, searchContractors);

export default router;