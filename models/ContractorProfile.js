import mongoose from "mongoose";

const contractorProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skills: {
    type: [String], // array of skills
    default: [],
  },
  experience: {
    type: Number, // years of experience
    default: 0,
  },
  certifications: {
    type: [String], // list of certifications/licenses
    default: [],
  },
  // You can add more fields like ratings, portfolio links, etc.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContractorProfile = mongoose.model(
  "ContractorProfile",
  contractorProfileSchema
);
export default ContractorProfile;
