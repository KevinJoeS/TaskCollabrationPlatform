import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Project name is required'], trim: true, maxlength: [120, 'Project name is too long'] },
    description: { type: String, default: '', trim: true, maxlength: [2000, 'Description is too long'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

schema.index({ members: 1 });

export default mongoose.model('Project', schema);
