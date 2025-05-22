import ContractorProfile from "../models/ContractorProfile.js";

export const updateContractorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Only allow contractors to update their profile
    if (req.user.role !== "contractor") {
      return res
        .status(403)
        .json({ message: "Only contractors can update their profile" });
    }

    // Find the contractor's profile
    let profile = await ContractorProfile.findOne({ userId });
    if (!profile) {
      // If not found, create a new one (optional)
      profile = new ContractorProfile({ userId });
    }

    // Update only provided fields
    const updatableFields = ["skills", "experience", "certifications"];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Update contractor profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchContractors = async (req, res) => {
  try {
    const { skill } = req.query;

    // Build search criteria for skills
    let criteria = {};
    if (skill) {
      criteria.skills = { $regex: skill, $options: "i" }; // case-insensitive partial match
    }

    // Find matching contractor profiles and populate user info
    const profiles = await ContractorProfile.find(criteria).populate(
      "userId",
      "name email phone"
    );

    // Format the response to include both user and profile info
    const contractors = profiles.map((profile) => ({
      _id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      skills: profile.skills,
      experience: profile.experience,
      certifications: profile.certifications,
      // Add more profile fields if needed
    }));

    res.json(contractors);
  } catch (error) {
    console.error("Contractor search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const listAllContractors = async (req, res) => {
  try {
    const profiles = await ContractorProfile.find({})
      .populate("userId", "name email phone");

    const contractors = profiles.map((profile) => ({
      _id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      skills: profile.skills,
      experience: profile.experience,
      certifications: profile.certifications,
    }));

    res.json(contractors);
  } catch (error) {
    console.error("List all contractors error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

