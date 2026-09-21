import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CircleCheck, UserPlus, UserMinus, MessageSquare, ArrowRightLeft, FolderPlus, UserCheck } from 'lucide-react';
import Avatar from './ui/Avatar';
import { statusLabel } from '../utils/constants';
import { timeAgo, formatDateTime } from '../utils/date';
import { useTaskPanel } from '../hooks/useTaskPanel';

const ICONS = {
  'project.created': FolderPlus,
  'member.added': UserPlus,
  'member.removed': UserMinus,
  'task.created': Plus,
  'task.completed': CircleCheck,
  'task.status': ArrowRightLeft,
  'task.assigned': UserCheck,
  'comment.added': MessageSquare,
};

function TaskRef({ item }) {
  const { openTask } = useTaskPanel();
  const title = item.meta?.title || 'a task';
  if (!item.task) return <span className="activity-ref">{title}</span>;
  return (
    <button type="button" className="activity-ref activity-ref-link" onClick={() => openTask(item.task._id || item.task)}>
      {title}
    </button>
  );
}

function sentence(item) {
  const who = <strong>{item.subject?.name || 'someone'}</strong>;
  switch (item.type) {
    case 'project.created':
      return <>created this project</>;
    case 'member.added':
      return <>added {who} to the project</>;
    case 'member.removed':
      return <>removed {who} from the project</>;
    case 'task.created':
      return (
        <>
          created <TaskRef item={item} />
        </>
      );
    case 'task.completed':
      return (
        <>
          completed <TaskRef item={item} />
        </>
      );
    case 'task.status':
      return (
        <>
          moved <TaskRef item={item} /> to {statusLabel(item.meta?.to)}
        </>
      );
    case 'task.assigned':
      return (
        <>
          assigned <TaskRef item={item} /> to {who}
        </>
      );
    case 'comment.added':
      return (
        <>
          commented on <TaskRef item={item} />
        </>
      );
    default:
      return <>updated the project</>;
  }
}

function ActivityItem({ item, showProject = true }) {
  const Icon = ICONS[item.type] || Plus;
  return (
    <li className="activity-item">
      <span className="activity-avatar">
        <Avatar user={item.actor} size={30} />
        <span className={`activity-glyph activity-glyph-${item.type.replace('.', '-')}`} aria-hidden="true">
          <Icon size={10} strokeWidth={2.4} />
        </span>
      </span>
      <div className="activity-text">
        <p>
          <strong>{item.actor?.name || 'Someone'}</strong> {sentence(item)}
        </p>
        {item.type === 'comment.added' && item.meta?.excerpt && <blockquote className="activity-quote">{item.meta.excerpt}</blockquote>}
        <p className="activity-meta">
          <time dateTime={item.createdAt} title={formatDateTime(item.createdAt)}>
            {timeAgo(item.createdAt)}
          </time>
          {showProject && item.project && (
            <>
              <span aria-hidden="true">in</span>
              <Link to={`/projects/${item.project._id}`}>{item.project.name}</Link>
            </>
          )}
        </p>
      </div>
    </li>
  );
}

export default memo(ActivityItem);
