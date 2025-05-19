import express from "express";
import {
  postProject,
  deleteProject,
  getAllProjects,
  getProjectsByCustomer,
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js"; // to protect the route

const router = express.Router();

// Customer must be authenticated to post project
router.post("/post", authenticate, postProject);
router.delete("/:id", authenticate, deleteProject); // <-- DELETE route
router.get("/getAll", authenticate, getAllProjects);
router.get("/getcustProject/:customerId", getProjectsByCustomer);
export default router;
