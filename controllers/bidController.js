import Project from "../models/Project.js";
import Bid from "../models/Bid.js";
//import User from "../models/User.js";

// Submit a new bid
export const submitBid = async (req, res) => {
  try {
    const { budget, message } = req.body;
    const { projectId } = req.params;

    if (req.user.role !== "contractor") {
      return res.status(403).json({ error: "Only contractors can place bids" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (
      project.status !== "open" ||
      project.biddingClosed ||
      new Date() > new Date(project.biddingDeadline)
    ) {
      return res
        .status(400)
        .json({ error: "Bidding is closed for this project" });
    }

    if (project.customerId.toString() === req.user._id) {
      return res
        .status(403)
        .json({ error: "Project owners cannot bid on their own projects" });
    }

    const existingBid = await Bid.findOne({
      project: projectId,
      contractor: req.user.userId,
    });
    if (existingBid) {
      return res
        .status(400)
        .json({ error: "You have already placed a bid on this project" });
    }

    if (!budget || budget <= 0) {
      return res.status(400).json({ error: "Invalid budget amount" });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const newBid = new Bid({
      project: projectId,
      contractor: req.user.userId,
      budget,
      message,
    });

    await newBid.save();

    res.status(201).json({
      message: "Bid submitted successfully",
      bid: newBid,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "You have already placed a bid on this project" });
    }
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing bid
export const updateBid = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { budget, message } = req.body;

    if (req.user.role !== "contractor") {
      return res
        .status(403)
        .json({ error: "Only contractors can update bids" });
    }

    if (!budget || budget <= 0) {
      return res.status(400).json({ error: "Invalid budget amount" });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (
      project.status !== "open" ||
      project.biddingClosed ||
      new Date() > new Date(project.biddingDeadline)
    ) {
      return res
        .status(400)
        .json({ error: "Bidding is closed for this project" });
    }

    const bid = await Bid.findOne({
      project: projectId,
      contractor: req.user.userId,
    });

    if (!bid) {
      return res.status(404).json({ error: "No existing bid to update" });
    }

    bid.budget = budget;
    bid.message = message;
    await bid.save();

    res.status(200).json({
      message: "Bid updated successfully",
      bid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a bid
export const deleteBid = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (req.user.role !== "contractor") {
      return res
        .status(403)
        .json({ error: "Only contractors can delete bids" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (
      project.status !== "open" ||
      project.biddingClosed ||
      new Date() > new Date(project.biddingDeadline)
    ) {
      return res
        .status(400)
        .json({ error: "Bidding is closed for this project" });
    }

    const bid = await Bid.findOne({
      project: projectId,
      contractor: req.user.userId,
    });

    if (!bid) {
      return res.status(404).json({ error: "No bid found to delete" });
    }

    await Bid.deleteOne({ _id: bid._id });

    res.status(200).json({ message: "Bid deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all bids on a project (owner only)
export const getProjectBids = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.customerId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Access denied. You do not own this project." });
    }

    const bids = await Bid.find({ project: projectId }).populate(
      "contractor",
      "name email skills"
    );

    res.status(200).json({ bids });
  } catch (error) {
    console.error("Error fetching project bids:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Manually close bidding (project owner)
export const toggleBidding = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.customerId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this project" });
    }

    // Toggle the biddingClosed flag
    project.biddingClosed = !project.biddingClosed;
    await project.save();

    res.status(200).json({
      message: `Bidding has been manually ${project.biddingClosed ? "closed" : "reopened"}`,
      biddingClosed: project.biddingClosed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

