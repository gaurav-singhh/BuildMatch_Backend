import express from "express";
import {
  submitBid,
  updateBid,
  deleteBid,
  getProjectBids,
} from "../controllers/bidController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateObjectId.js";

const bidRouter = express.Router({ mergeParams: true });

bidRouter.post(
  "/submit",
  authenticate,
  validateObjectId("projectId"),
  submitBid
);
bidRouter.post(
  "/update",
  authenticate,
  validateObjectId("projectId"),
  updateBid
);
bidRouter.delete(
  "/delete",
  authenticate,
  validateObjectId("projectId"),
  deleteBid
);
bidRouter.get(
  "/projectBids",
  authenticate,
  validateObjectId("projectId"),
  getProjectBids
);
export default bidRouter;
