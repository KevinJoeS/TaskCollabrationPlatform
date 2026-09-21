import Activity from '../models/Activity.js';
import { HttpError, isValidId } from '../utils/http.js';
import { projectIdsFor, sameId } from '../utils/access.js';

export async function listActivity(req, res) {
  const allowed = await projectIdsFor(req.user._id);
  const q = { project: { $in: allowed } };
  if (req.query.project) {
    if (!isValidId(String(req.query.project))) throw new HttpError(400, 'Invalid project id');
    if (!allowed.some((id) => sameId(id, req.query.project))) throw new HttpError(403, 'You are not a member of this project');
    q.project = req.query.project;
  }
  if (req.query.before) {
    const before = new Date(String(req.query.before));
    if (!Number.isNaN(before.getTime())) q.createdAt = { $lt: before };
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const activity = await Activity.find(q)
    .sort('-createdAt')
    .limit(limit)
    .populate('actor', 'name email avatar')
    .populate('subject', 'name email avatar')
    .populate('project', 'name');
  res.json({ activity });
}
