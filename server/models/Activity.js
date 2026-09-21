import mongoose from 'mongoose';

export const ACTIVITY_TYPES = [
  'project.created',
  'member.added',
  'member.removed',
  'task.created',
  'task.completed',
  'task.status',
  'task.assigned',
  'comment.added',
];

// One row per thing that happened in a project. Titles are copied into `meta`
// so the feed still reads correctly after a task is renamed or deleted.
const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    meta: { type: Object, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

schema.index({ project: 1, createdAt: -1 });

export default mongoose.model('Activity', schema);
