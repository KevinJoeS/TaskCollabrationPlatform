import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: [true, 'Comment cannot be empty'], trim: true, maxlength: [4000, 'Comment is too long'] },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', schema);
