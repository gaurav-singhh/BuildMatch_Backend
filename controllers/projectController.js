import Project from "../models/Project.js";

export const postProject = async (req, res) => {
  try {
    const { title,
       description,
        location,
         budget,
          biddingDeadline,
           ProjectDeadline,
            files } = req.body;
    const customerId = req.user.userId; // assuming auth middleware sets req.user

    if (!title || !description || !location || !budget || !ProjectDeadline || !biddingDeadline) {
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
      ProjectDeadline,
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
