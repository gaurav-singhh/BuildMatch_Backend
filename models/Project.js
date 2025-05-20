import mongoose from "mongoose";

// Define schema for a construction project posted by a customer
const projectSchema = new mongoose.Schema(
  {
    // Title of the project
    title: {
      type: String,
      required: true,
    },

    // Detailed description of the work to be done
    description: {
      type: String,
      required: true,
    },

    // Location where the project will take place
    location: {
      type: String,
      required: true,
    },

    // Estimated budget for the entire project
    budget: {
      type: Number,
      required: true,
    },

    // Bidding deadline (after this, no new bids are accepted)
    biddingDeadline: {
      type: Date,
      required: true,
    },

    ProjectDeadline: {
      type: Date,
      required: true,
    },

    // Optional list of file URLs or filenames (e.g. project plans, images)
    files: [
      {
        type: String,
      },
    ],

    // Reference to the customer (user) who created the project
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Current status of the project
    status: {
      type: String,
      enum: ["open", "closed", "in progress", "completed", "cancelled"],
      default: "open",
    },

    // Boolean flag to manually or programmatically close bidding
    biddingClosed: {
      type: Boolean,
      default: false,
    },

    // Reference to the contractor who was assigned to the project
    assignedContractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },

  // Automatically adds `createdAt` and `updatedAt` timestamps
  {
    timestamps: true,
  }
);

// Create and export the Project model
const Project = mongoose.model("Project", projectSchema);
export default Project;
