import { useNavigate } from 'react-router-dom';
import { Bell, UserCheck, Clock, MessageSquare, Flag, UserPlus, CheckCheck } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { SkeletonRows } from './ui/Skeleton';
import { EmptyState, ErrorState } from './ui/States';
import { useNotifications } from '../hooks/useWorkspace';
import { useTaskPanel } from '../hooks/useTaskPanel';
import { notificationService } from '../services/workspace';
import { setCached } from '../lib/store';
import { useToast } from '../context/ToastContext';
import { timeAgo } from '../utils/date';

const ICONS = { 'task.assigned': UserCheck, 'task.due': Clock, 'comment.added': MessageSquare, 'project.milestone': Flag, 'member.added': UserPlus };

export default function NotificationCenter({ open, onClose }) {
  const { notifications, unread, loading, error, reload } = useNotifications();
  const { openTask } = useTaskPanel();
  const navigate = useNavigate();
  const toast = useToast();

  const markLocal = (fn) => setCached('notifications', (d) => { const list = d.notifications.map(fn); return { notifications: list, unread: list.filter((n) => !n.read).length }; });

  const openItem = (n) => {
    if (!n.read) {
      markLocal((x) => (x._id === n._id ? { ...x, read: true } : x));
      notificationService.markRead(n._id).catch(() => reload());
    }
    onClose();
    if (n.task) setTimeout(() => openTask(n.task), 0);
    else if (n.project) navigate(`/projects/${n.project._id || n.project}`);
  };

  const markAll = async () => {
    markLocal((x) => ({ ...x, read: true }));
    try {
      await notificationService.markAllRead();
    } catch (err) {
      toast.error(err.message);
      reload();
    }
  };

  return (
    <Modal open={open} onClose={onClose} variant="panel" size="sm" title="Notifications" description={unread ? `${unread} unread` : 'You are all caught up.'}>
      {unread > 0 && (
        <div className="notif-toolbar">
          <Button variant="ghost" size="sm" icon={CheckCheck} onClick={markAll}>
            Mark all as read
          </Button>
        </div>
      )}
      {loading ? (
        <SkeletonRows rows={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={reload} compact />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet." body="Assignments, comments on your tasks and approaching deadlines will show up here." />
      ) : (
        <ul className="notif-list">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <li key={n._id}>
                <button type="button" className={`notif ${n.read ? '' : 'is-unread'}`} onClick={() => openItem(n)}>
                  <span className={`notif-icon ${n.type === 'task.due' ? 'notif-icon-urgent' : ''}`} aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <span className="notif-text">
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-meta">
                      {timeAgo(n.createdAt)}
                      {n.project?.name ? ` in ${n.project.name}` : ''}
                    </span>
                  </span>
                  {!n.read && <span className="notif-dot" aria-label="Unread" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
