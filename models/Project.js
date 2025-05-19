import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  files: [
    {
      type: String, // store file URLs or filenames (optional)
    },
  ],
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  bids: [
    {
      contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amount: {
        type: Number,
      },
      message: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Project = mongoose.model("Project", projectSchema);
export default Project;
