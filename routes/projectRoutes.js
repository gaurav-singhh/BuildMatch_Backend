import express from "express";
import {
  postProject,
  deleteProject,
  getAllProjects,
  getProjectsByCustomer,
  assignContractorToProject,
  updateProject
} from "../controllers/projectController.js";
import { authenticate } from "../middleware/authMiddleware.js"; // to protect the route

const router = express.Router();

// Customer must be authenticated to post project
router.post("/post", authenticate, postProject);
router.delete("delete-project/:id", authenticate, deleteProject); 
router.get("/getAll", authenticate, getAllProjects);
router.get("/getcustProject/:customerId", getProjectsByCustomer);
router.put("/:projectId/assign/:bidId",authenticate, assignContractorToProject);
router.patch("/update-project/:id", authenticate, updateProject);
export default router;
