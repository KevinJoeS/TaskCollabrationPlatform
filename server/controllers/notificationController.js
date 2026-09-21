import Notification from '../models/Notification.js';
import { HttpError } from '../utils/http.js';
import { ensureDueReminders } from '../utils/events.js';

export async function listNotifications(req, res) {
  await ensureDueReminders(req.user._id);
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort('-createdAt').limit(40).populate('project', 'name'),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ notifications, unread });
}

export async function markRead(req, res) {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: req.body.read !== false }, { new: true });
  if (!n) throw new HttpError(404, 'Notification not found');
  res.json({ notification: n });
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
}
