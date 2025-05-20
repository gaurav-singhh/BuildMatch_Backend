import mongoose from 'mongoose';

const { Schema } = mongoose;

const bidSchema = new Schema({
  project: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  contractor: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  budget: {
    type: Number,
    required: true,
    min: [1, 'Budget must be a positive number']
  },
  message: {
    type: String,
    required: [true, 'Message is required']
  }
}, { timestamps: true });

// Enforce one bid per contractor per project
bidSchema.index({ project: 1, contractor: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
