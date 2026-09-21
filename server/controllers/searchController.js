import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { escapeRegex, str } from '../utils/http.js';
import { sameId } from '../utils/access.js';

export async function search(req, res) {
  const term = (str(req.query.q) || '').slice(0, 80);
  if (term.length < 2) return res.json({ projects: [], tasks: [], members: [] });
  const rx = new RegExp(escapeRegex(term), 'i');

  const myProjects = await Project.find({ members: req.user._id }).populate('members', 'name email avatar').select('name description members');
  const ids = myProjects.map((p) => p._id);

  const tasks = await Task.find({ project: { $in: ids }, $or: [{ title: rx }, { description: rx }] })
    .select('title status priority project dueDate')
    .populate('project', 'name')
    .sort('-updatedAt')
    .limit(8);

  const seen = new Map();
  for (const p of myProjects) for (const m of p.members) if (!seen.has(String(m._id))) seen.set(String(m._id), m);
  const members = [...seen.values()].filter((m) => !sameId(m, req.user) && (rx.test(m.name) || rx.test(m.email))).slice(0, 6);

  res.json({
    projects: myProjects.filter((p) => rx.test(p.name) || rx.test(p.description)).slice(0, 6).map((p) => ({ _id: p._id, name: p.name, memberCount: p.members.length })),
    tasks,
    members,
  });
}
