import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { updateUserBasicInfo } from "../controllers/userController.js";

const router = express.Router();

router.patch("/update", authenticate, updateUserBasicInfo);

export default router;
