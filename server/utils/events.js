import Activity from '../models/Activity.js';
import Notification from '../models/Notification.js';
import Task from '../models/Task.js';
import { sameId } from './access.js';

// Activity and notifications are side effects. A failure here must never fail
// the request that triggered it, so everything is caught and logged.
const safe = (label, fn) => fn().catch((e) => console.error(`[${label}]`, e.message));

export const logActivity = (entry) => safe('activity', () => Activity.create(entry));

export function notify(userIds, actorId, payload) {
  const recipients = [...new Set(userIds.filter(Boolean).map(String))].filter((id) => !sameId(id, actorId));
  if (!recipients.length) return Promise.resolve();
  return safe('notify', async () => {
    for (const user of recipients) {
      const { dedupeKey, ...rest } = payload;
      if (dedupeKey) {
        // Atomic "create once": safe even when two requests arrive together.
        await Notification.updateOne({ user, dedupeKey }, { $setOnInsert: { ...rest, read: false, createdAt: new Date() } }, { upsert: true }).catch((e) => {
          if (e?.code !== 11000) throw e;
        });
      } else {
        await Notification.create({ ...payload, user });
      }
    }
  });
}

/** Notifies every member once when a project first crosses 80% and 100% completion. */
export async function checkMilestone(project, actorId) {
  return safe('milestone', async () => {
    const [total, done] = await Promise.all([
      Task.countDocuments({ project: project._id }),
      Task.countDocuments({ project: project._id, status: 'done' }),
    ]);
    if (total < 3) return;
    const pct = Math.round((done / total) * 100);
    const mark = pct >= 100 ? 100 : pct >= 80 ? 80 : null;
    if (!mark) return;
    await notify(project.members, mark === 100 ? null : actorId, {
      type: 'project.milestone',
      message: mark === 100 ? `${project.name} is complete. Every task is done.` : `${project.name} reached ${pct}% completion.`,
      project: project._id,
      dedupeKey: `milestone:${project._id}:${mark}`,
    });
  });
}

/** Creates "due tomorrow" / "due today" / "overdue" reminders lazily when the user opens notifications. */
export async function ensureDueReminders(userId) {
  return safe('reminders', async () => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 36 * 60 * 60 * 1000);
    const tasks = await Task.find({ assignedTo: userId, status: { $ne: 'done' }, dueDate: { $ne: null, $lte: horizon } })
      .select('title dueDate project')
      .limit(50);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (const t of tasks) {
      const dayDiff = Math.floor((new Date(t.dueDate).setHours(0, 0, 0, 0) - startOfToday.getTime()) / 86400000);
      const when = dayDiff < 0 ? 'overdue' : dayDiff === 0 ? 'today' : 'tomorrow';
      const message =
        when === 'overdue' ? `"${t.title}" is overdue.` : `"${t.title}" is due ${when}.`;
      await notify([userId], null, {
        type: 'task.due',
        message,
        task: t._id,
        project: t.project,
        dedupeKey: `due:${t._id}:${when}`,
      });
    }
  });
}
