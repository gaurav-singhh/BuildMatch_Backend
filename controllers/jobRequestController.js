import JobRequest from "../models/JobRequest.js";

export const sendJobRequest = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can send job requests." });
    }
    const { contractorId, projectId } = req.body;
    const customerId = req.user.userId;

    // Optionally, check if project belongs to this customer and is open

    // Prevent duplicate requests
    const existing = await JobRequest.findOne({ contractorId, projectId });
    if (existing) {
      return res.status(400).json({ message: "Job request already sent to this contractor for this project." });
    }

    const jobRequest = new JobRequest({
      contractorId,
      projectId,
      customerId,
    });

    await jobRequest.save();
    res.json({ message: "Job request sent successfully", jobRequest });
  } catch (error) {
    console.error("Send job request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendDirectJobRequest = async (req, res) => {
  try {

    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can send job requests." });
    }
    const { contractorId, requirements, budget } = req.body;
    const customerId = req.user.userId;

    // Prevent duplicate direct requests (optional)
    const existing = await JobRequest.findOne({ contractorId, customerId, requirements, budget, projectId: null });
    if (existing) {
      return res.status(400).json({ message: "Direct job request already sent to this contractor." });
    }

    const jobRequest = new JobRequest({
      contractorId,
      customerId,
      requirements,
      budget,
      projectId: null, // Explicitly set to null for direct requests
    });

    await jobRequest.save();
    res.json({ message: "Direct job request sent successfully", jobRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getJobRequestsForContractor = async (req, res) => {
  try {
    const contractorId = req.user.userId;
    const requests = await JobRequest.find({ contractorId })
      .populate("projectId")
      .populate("customerId", "name email");
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const respondToJobRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action } = req.body; // "accept" or "reject"
    const contractorId = req.user.userId;

    const jobRequest = await JobRequest.findOne({ _id: requestId, contractorId });
    if (!jobRequest) return res.status(404).json({ message: "Job request not found" });

    if (action === "accept") jobRequest.status = "accepted";
    else if (action === "reject") jobRequest.status = "rejected";
    else return res.status(400).json({ message: "Invalid action" });

    await jobRequest.save();
    res.json({ message: `Job request ${action}ed`, jobRequest });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};