import Project from "../models/Project.js";
import Bid from "../models/Bid.js";

export const postProject = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      budget,
      biddingDeadline,
      projectDeadline,
      files,
    } = req.body;
    const customerId = req.user.userId; // assuming auth middleware sets req.user

    if (
      !title ||
      !description ||
      !location ||
      !budget ||
      !projectDeadline ||
      !biddingDeadline
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const project = new Project({
      title,
      description,
      location,
      budget,
      biddingDeadline,
      projectDeadline,
      files: files || [],
      customerId,
    });

    await project.save();

    res.status(201).json({ message: "Project posted successfully", project });
  } catch (error) {
    console.error("Error posting project:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId; // set by the JWT middleware

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if the logged-in user is the one who posted the project
    if (project.customerId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this project" });
    }

    await Project.findByIdAndDelete(projectId);

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("customerId", "name email");
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const projects = await Project.find({ customerId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching customer projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const assignContractorToProject = async (req, res) => {
  try {
    const { projectId, bidId } = req.params;
    const customerId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.customerId.toString() !== customerId) {
      return res
        .status(403)
        .json({ error: "You are not the owner of this project" });
    }

    if (project.status === "assigned") {
      return res.status(400).json({ error: "Project already assigned" });
    }

    const bid = await Bid.findById(bidId);
    if (!bid || bid.project.toString() !== projectId) {
      return res
        .status(404)
        .json({ error: "Bid not found or doesn't belong to this project" });
    }

    // Assign contractor and update project
    project.assignedContractor = bid.contractor;
    project.status = "assigned";
    project.biddingClosed = true;

    await project.save();

    res.status(200).json({
      message: "Contractor successfully assigned to project",
      assignedContractor: bid.contractor,
      projectId: project._id,
    });
  } catch (error) {
    console.error("Error assigning contractor:", error);
    res.status(500).json({ error: "Server error" });
  }
};
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.customerId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized to update this project" });
    }

    // Only update fields provided in req.body
    const updatableFields = [
      "title",
      "description",
      "location",
      "budget",
      "biddingDeadline",
      "projectDeadline",
      "files"
    ];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    res.json({ message: "Project updated successfully", project });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ message: "Server error" });
  }
};