import Task, { TASK_STATUSES, TASK_PRIORITIES } from '../models/Task.js';
import Comment from '../models/Comment.js';
import { HttpError, str, isValidId } from '../utils/http.js';
import { loadProjectForMember, loadTaskForMember, projectIdsFor, sameId } from '../utils/access.js';
import { logActivity, notify, checkMilestone } from '../utils/events.js';
import { attachCommentCounts } from './projectController.js';

const MEMBER_FIELDS = 'name email avatar';

/**
 * Builds a safe patch from the request body. Only known fields are copied, so a
 * client cannot move a task to another project or rewrite createdBy.
 */
function readTaskFields(body, project, { partial }) {
  const out = {};
  if (body.title !== undefined || !partial) {
    const title = str(body.title);
    if (!title) throw new HttpError(400, 'Task title is required');
    out.title = title;
  }
  if (body.description !== undefined) out.description = str(body.description) || '';
  if (body.status !== undefined) {
    if (!TASK_STATUSES.includes(body.status)) throw new HttpError(400, 'Unknown status');
    out.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!TASK_PRIORITIES.includes(body.priority)) throw new HttpError(400, 'Unknown priority');
    out.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') out.dueDate = null;
    else {
      const d = new Date(body.dueDate);
      if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Due date is not a valid date');
      out.dueDate = d;
    }
  }
  if (body.assignedTo !== undefined) {
    if (body.assignedTo === null || body.assignedTo === '') out.assignedTo = null;
    else {
      if (!isValidId(String(body.assignedTo))) throw new HttpError(400, 'Invalid assignee id');
      if (!project.members.some((m) => sameId(m, body.assignedTo))) throw new HttpError(400, 'Assignee must be a member of the project');
      out.assignedTo = body.assignedTo;
    }
  }
  return out;
}

const populateTask = (t) => t.populate([{ path: 'assignedTo', select: MEMBER_FIELDS }, { path: 'project', select: 'name members' }, { path: 'createdBy', select: MEMBER_FIELDS }]);

export async function createTask(req, res) {
  const project = await loadProjectForMember(String(req.body.project || ''), req.user._id);
  const fields = readTaskFields(req.body, project, { partial: false });
  const task = await Task.create({ ...fields, project: project._id, createdBy: req.user._id });

  logActivity({ project: project._id, actor: req.user._id, type: 'task.created', task: task._id, meta: { title: task.title } });
  if (task.assignedTo) {
    notify([task.assignedTo], req.user._id, {
      type: 'task.assigned',
      message: `${req.user.name} assigned you "${task.title}".`,
      task: task._id,
      project: project._id,
    });
  }

  await populateTask(task);
  res.status(201).json({ task: { ...task.toJSON(), commentCount: 0 } });
}

export async function listTasks(req, res) {
  // Only tasks from projects the user belongs to are ever returned.
  const allowed = await projectIdsFor(req.user._id);
  const q = { project: { $in: allowed } };
  if (req.query.project) {
    if (!isValidId(String(req.query.project))) throw new HttpError(400, 'Invalid project id');
    if (!allowed.some((id) => sameId(id, req.query.project))) throw new HttpError(403, 'You are not a member of this project');
    q.project = req.query.project;
  }
  if (req.query.status) q.status = String(req.query.status);
  if (req.query.priority) q.priority = String(req.query.priority);
  if (req.query.mine === 'true') q.assignedTo = req.user._id;
  else if (req.query.assignedTo) {
    if (!isValidId(String(req.query.assignedTo))) throw new HttpError(400, 'Invalid assignee id');
    q.assignedTo = req.query.assignedTo;
  }
  const tasks = await Task.find(q).populate('assignedTo', MEMBER_FIELDS).populate('project', 'name').sort('-createdAt').limit(500);
  res.json({ tasks: await attachCommentCounts(tasks) });
}

export async function getTask(req, res) {
  const { task } = await loadTaskForMember(req.params.id, req.user._id);
  await task.populate([
    { path: 'assignedTo', select: MEMBER_FIELDS },
    { path: 'createdBy', select: MEMBER_FIELDS },
    { path: 'project', select: 'name members createdBy', populate: { path: 'members', select: MEMBER_FIELDS } },
  ]);
  res.json({ task });
}

export async function updateTask(req, res) {
  const { task, project } = await loadTaskForMember(req.params.id, req.user._id);
  const patch = readTaskFields(req.body, project, { partial: true });
  const before = { status: task.status, assignedTo: task.assignedTo ? String(task.assignedTo) : null };
  Object.assign(task, patch);
  await task.save();

  if (patch.status && patch.status !== before.status) {
    const completed = patch.status === 'done';
    logActivity({
      project: project._id,
      actor: req.user._id,
      type: completed ? 'task.completed' : 'task.status',
      task: task._id,
      meta: { title: task.title, from: before.status, to: patch.status },
    });
    if (completed) checkMilestone(project, req.user._id);
  }
  const after = task.assignedTo ? String(task.assignedTo) : null;
  if (patch.assignedTo !== undefined && after !== before.assignedTo && after) {
    logActivity({ project: project._id, actor: req.user._id, type: 'task.assigned', task: task._id, subject: after, meta: { title: task.title } });
    notify([after], req.user._id, {
      type: 'task.assigned',
      message: `${req.user.name} assigned you "${task.title}".`,
      task: task._id,
      project: project._id,
    });
  }

  await populateTask(task);
  const commentCount = await Comment.countDocuments({ task: task._id });
  res.json({ task: { ...task.toJSON(), commentCount } });
}

export async function deleteTask(req, res) {
  const { task } = await loadTaskForMember(req.params.id, req.user._id);
  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
}
