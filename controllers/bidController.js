import Project from "../models/Project.js";
import Bid from "../models/Bid.js";
import User from "../models/User.js";

export const submitBid = async (req, res) => {
  try {
    const { budget, message } = req.body;
    const { projectId } = req.params;

    // Ensure user is a contractor
    if (req.user.role !== "contractor") {
      return res.status(403).json({ error: "Only contractors can place bids" });
    }

    // Fetch project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure project is open and bidding not closed
    if (
      project.status !== "open" ||
      new Date() > new Date(project.biddingDeadline)
    ) {
      return res
        .status(400)
        .json({ error: "Bidding is closed for this project" });
    }

    // Prevent owner from bidding on own project
    if (project.customerId.toString() === req.user._id) {
      return res
        .status(403)
        .json({ error: "Project owners cannot bid on their own projects" });
    }

    // Check if contractor already placed a bid
    const existingBid = await Bid.findOne({
      project: projectId,
      contractor: req.user.userId,
    });
    if (existingBid) {
      return res
        .status(400)
        .json({ error: "You have already placed a bid on this project" });
    }

    // Validate input
    if (!budget || budget <= 0) {
      return res.status(400).json({ error: "Invalid budget amount" });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Create and save bid
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
export const updateBid = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { budget, message } = req.body;

    // Ensure user is a contractor
    if (req.user.role !== "contractor") {
      return res
        .status(403)
        .json({ error: "Only contractors can update bids" });
    }

    // Validate input
    if (!budget || budget <= 0) {
      return res.status(400).json({ error: "Invalid budget amount" });
    }
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Fetch project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure project is still open for bidding
    if (
      project.status !== "open" ||
      new Date() > new Date(project.biddingDeadline)
    ) {
      return res
        .status(400)
        .json({ error: "Bidding is closed for this project" });
    }

    // Find existing bid
    const bid = await Bid.findOne({
      project: projectId,
      contractor: req.user.userId,
    });

    if (!bid) {
      return res.status(404).json({ error: "No existing bid to update" });
    }

    // Update bid details
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

export const deleteBid = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Ensure user is a contractor
    if (req.user.role !== "contractor") {
      return res
        .status(403)
        .json({ error: "Only contractors can delete bids" });
    }

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if bidding deadline has passed or project is closed
    if (
      project.status !== "open" ||
      new Date() > new Date(project.biddingDeadline)
    ) {
      return res
        .status(400)
        .json({ error: "Bidding is closed for this project" });
    }

    // Find the bid for this contractor and project
    const bid = await Bid.findOne({
      project: projectId,
      contractor: req.user.userId,
    });

    if (!bid) {
      return res.status(404).json({ error: "No bid found to delete" });
    }

    // Delete the bid
    await Bid.deleteOne({ _id: bid._id });

    res.status(200).json({ message: "Bid deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getProjectBids = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if the current user is the project owner
    if (project.customerId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Access denied. You do not own this project." });
    }

    // Fetch all bids for the project with contractor details
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
