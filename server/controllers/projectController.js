import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import { HttpError, str } from '../utils/http.js';
import { loadProjectForMember, sameId } from '../utils/access.js';
import { logActivity, notify } from '../utils/events.js';

const MEMBER_FIELDS = 'name email avatar';
const PROJECT_POPULATE = [
  { path: 'members', select: MEMBER_FIELDS },
  { path: 'createdBy', select: MEMBER_FIELDS },
];
// Works for both queries and already-loaded documents.
const populateProject = (target) => target.populate(PROJECT_POPULATE);

/** { projectId: { total, done, overdue } } for a set of projects, using two small aggregates. */
async function statsFor(projectIds) {
  const [byStatus, overdue] = await Promise.all([
    Task.aggregate([{ $match: { project: { $in: projectIds } } }, { $group: { _id: { project: '$project', status: '$status' }, n: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { project: { $in: projectIds }, status: { $ne: 'done' }, dueDate: { $ne: null, $lt: new Date() } } },
      { $group: { _id: '$project', n: { $sum: 1 } } },
    ]),
  ]);
  const out = {};
  const slot = (id) => (out[String(id)] ??= { total: 0, done: 0, overdue: 0 });
  for (const r of byStatus) {
    const s = slot(r._id.project);
    s.total += r.n;
    if (r._id.status === 'done') s.done += r.n;
  }
  for (const r of overdue) slot(r._id).overdue = r.n;
  return out;
}

export async function attachCommentCounts(tasks) {
  if (!tasks.length) return [];
  const rows = await Comment.aggregate([{ $match: { task: { $in: tasks.map((t) => t._id) } } }, { $group: { _id: '$task', n: { $sum: 1 } } }]);
  const counts = Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
  return tasks.map((t) => ({ ...t.toJSON(), commentCount: counts[String(t._id)] || 0 }));
}

export async function createProject(req, res) {
  const name = str(req.body.name);
  if (!name) throw new HttpError(400, 'Project name is required');

  // Optional: invite existing users by email while creating the project.
  const emails = Array.isArray(req.body.memberEmails)
    ? [...new Set(req.body.memberEmails.map((e) => str(e)?.toLowerCase()).filter(Boolean))].slice(0, 50)
    : [];
  const found = emails.length ? await User.find({ email: { $in: emails } }).select('email') : [];
  const notFound = emails.filter((e) => !found.some((u) => u.email === e));
  const invited = found.filter((u) => !sameId(u, req.user));

  const project = await Project.create({
    name,
    description: str(req.body.description) || '',
    createdBy: req.user._id,
    members: [req.user._id, ...invited.map((u) => u._id)],
  });

  logActivity({ project: project._id, actor: req.user._id, type: 'project.created', meta: { projectName: project.name } });
  for (const u of invited) logActivity({ project: project._id, actor: req.user._id, type: 'member.added', subject: u._id });
  notify(invited.map((u) => u._id), req.user._id, {
    type: 'member.added',
    message: `${req.user.name} added you to ${project.name}.`,
    project: project._id,
  });

  await populateProject(project);
  res.status(201).json({ project: { ...project.toJSON(), stats: { total: 0, done: 0, overdue: 0 } }, notFound });
}

export async function listProjects(req, res) {
  const projects = await populateProject(Project.find({ members: req.user._id })).sort('-updatedAt');
  const stats = await statsFor(projects.map((p) => p._id));
  res.json({ projects: projects.map((p) => ({ ...p.toJSON(), stats: stats[String(p._id)] || { total: 0, done: 0, overdue: 0 } })) });
}

export async function getProject(req, res) {
  const project = await loadProjectForMember(req.params.id, req.user._id);
  await populateProject(project);
  const tasks = await Task.find({ project: project._id }).populate('assignedTo', MEMBER_FIELDS).sort('-createdAt');
  const stats = (await statsFor([project._id]))[String(project._id)] || { total: 0, done: 0, overdue: 0 };
  res.json({ project: { ...project.toJSON(), stats }, tasks: await attachCommentCounts(tasks) });
}

export async function updateProject(req, res) {
  const project = await loadProjectForMember(req.params.id, req.user._id);
  if (!sameId(project.createdBy, req.user)) throw new HttpError(403, 'Only the project creator can edit the project');
  if (req.body.name !== undefined) {
    const name = str(req.body.name);
    if (!name) throw new HttpError(400, 'Project name is required');
    project.name = name;
  }
  if (req.body.description !== undefined) project.description = str(req.body.description) || '';
  await project.save();
  await populateProject(project);
  res.json({ project });
}

export async function addMember(req, res) {
  const project = await loadProjectForMember(req.params.id, req.user._id);
  if (!sameId(project.createdBy, req.user)) throw new HttpError(403, 'Only the project creator can add members');
  const email = str(req.body.email)?.toLowerCase();
  if (!email) throw new HttpError(400, 'Email is required');
  const user = await User.findOne({ email });
  if (!user) throw new HttpError(404, 'No TaskCollab account uses that email');
  if (project.members.some((m) => sameId(m, user))) throw new HttpError(409, `${user.name} is already a member`);

  project.members.push(user._id);
  await project.save();
  logActivity({ project: project._id, actor: req.user._id, type: 'member.added', subject: user._id });
  notify([user._id], req.user._id, { type: 'member.added', message: `${req.user.name} added you to ${project.name}.`, project: project._id });

  await populateProject(project);
  res.json({ project });
}

export async function removeMember(req, res) {
  const project = await loadProjectForMember(req.params.id, req.user._id);
  const target = req.params.userId;
  const isCreator = sameId(project.createdBy, req.user);
  if (!isCreator && !sameId(target, req.user)) throw new HttpError(403, 'Only the project creator can remove other members');
  if (sameId(project.createdBy, target)) throw new HttpError(400, 'The project creator cannot be removed');
  if (!project.members.some((m) => sameId(m, target))) throw new HttpError(404, 'That person is not a member of this project');

  project.members = project.members.filter((m) => !sameId(m, target));
  await project.save();
  await Task.updateMany({ project: project._id, assignedTo: target }, { assignedTo: null });
  logActivity({ project: project._id, actor: req.user._id, type: 'member.removed', subject: target });

  await populateProject(project);
  res.json({ project });
}

export async function deleteProject(req, res) {
  const project = await loadProjectForMember(req.params.id, req.user._id);
  if (!sameId(project.createdBy, req.user)) throw new HttpError(403, 'Only the creator can delete the project');
  const taskIds = await Task.find({ project: project._id }).distinct('_id');
  await Promise.all([
    Comment.deleteMany({ task: { $in: taskIds } }),
    Task.deleteMany({ project: project._id }),
    Activity.deleteMany({ project: project._id }),
    Notification.deleteMany({ project: project._id }),
  ]);
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
}
