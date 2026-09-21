import mongoose from 'mongoose';

// 'done' is kept as the stored value for the "Completed" column so tasks created
// before the five-column board keep working without a data migration.
export const TASK_STATUSES = ['backlog', 'todo', 'in-progress', 'in-review', 'done'];
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: [200, 'Task title is too long'] },
    description: { type: String, default: '', trim: true, maxlength: [5000, 'Description is too long'] },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    status: { type: String, enum: { values: TASK_STATUSES, message: 'Unknown status' }, default: 'todo' },
    priority: { type: String, enum: { values: TASK_PRIORITIES, message: 'Unknown priority' }, default: 'medium' },
    dueDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Task', schema);
