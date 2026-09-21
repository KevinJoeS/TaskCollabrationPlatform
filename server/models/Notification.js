import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['task.assigned', 'task.due', 'comment.added', 'project.milestone', 'member.added'], required: true },
    message: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    read: { type: Boolean, default: false },
    // Prevents the same reminder or milestone from being created twice.
    dedupeKey: { type: String, default: undefined },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ user: 1, createdAt: -1 });
schema.index({ user: 1, dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } });

export default mongoose.model('Notification', schema);
