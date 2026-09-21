import { CircleDashed, Circle, CircleDot, CircleCheck, Calendar, AlertTriangle } from 'lucide-react';
import { statusLabel, priorityLabel } from '../../utils/constants';
import { describeDue } from '../../utils/date';

// Status is always icon + words, never colour alone.
function HalfCircle({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const STATUS_ICON = { backlog: CircleDashed, todo: Circle, 'in-progress': HalfCircle, 'in-review': CircleDot, done: CircleCheck };

export function StatusIcon({ status, size = 14 }) {
  const Icon = STATUS_ICON[status] || Circle;
  return (
    <span className={`status-icon status-${status}`}>
      <Icon size={size} aria-hidden="true" />
    </span>
  );
}

export function StatusBadge({ status, plain = false }) {
  return (
    <span className={`badge ${plain ? 'badge-plain' : ''} status-${status}`}>
      <StatusIcon status={status} size={13} />
      {statusLabel(status)}
    </span>
  );
}

/** Three ascending bars; the number filled shows priority. */
export function PriorityIcon({ priority, size = 14 }) {
  const level = { low: 1, medium: 2, high: 3 }[priority] || 0;
  return (
    <svg className={`priority-icon priority-${priority}`} width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect key={i} x={1 + i * 4.5} y={9 - i * 3.5} width="3" height={4 + i * 3.5} rx="0.8" fill="currentColor" opacity={i < level ? 1 : 0.22} />
      ))}
    </svg>
  );
}

export function PriorityBadge({ priority, plain = true }) {
  return (
    <span className={`badge ${plain ? 'badge-plain' : ''} priority-${priority}`}>
      <PriorityIcon priority={priority} />
      {priorityLabel(priority)}
    </span>
  );
}

export function DueLabel({ date, done = false, icon = true }) {
  const { label, urgency } = describeDue(date, done);
  const Icon = urgency === 'overdue' ? AlertTriangle : Calendar;
  return (
    <span className={`due due-${urgency} num`}>
      {icon && <Icon size={13} aria-hidden="true" />}
      {label}
    </span>
  );
}

export function CountBadge({ children }) {
  return <span className="count-badge num">{children}</span>;
}
