import Comment from '../models/Comment.js';
import { HttpError, str } from '../utils/http.js';
import { loadTaskForMember, sameId } from '../utils/access.js';
import { logActivity, notify } from '../utils/events.js';

const AUTHOR_FIELDS = 'name email avatar';

export async function listComments(req, res) {
  await loadTaskForMember(req.params.taskId, req.user._id);
  const comments = await Comment.find({ task: req.params.taskId }).populate('author', AUTHOR_FIELDS).sort('createdAt');
  res.json({ comments });
}

export async function addComment(req, res) {
  const { task, project } = await loadTaskForMember(req.params.taskId, req.user._id);
  const content = str(req.body.content);
  if (!content) throw new HttpError(400, 'Comment cannot be empty');
  const comment = await Comment.create({ task: task._id, author: req.user._id, content });

  logActivity({ project: project._id, actor: req.user._id, type: 'comment.added', task: task._id, meta: { title: task.title, excerpt: content.slice(0, 140) } });
  notify([task.assignedTo, task.createdBy], req.user._id, {
    type: 'comment.added',
    message: `${req.user.name} commented on "${task.title}".`,
    task: task._id,
    project: project._id,
  });

  res.status(201).json({ comment: await comment.populate('author', AUTHOR_FIELDS) });
}

export async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new HttpError(404, 'Comment not found');
  if (!sameId(comment.author, req.user)) throw new HttpError(403, 'Only the author can delete this comment');
  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
}
