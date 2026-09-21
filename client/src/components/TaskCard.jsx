import { memo } from 'react';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import Avatar from './ui/Avatar';
import { PriorityBadge, DueLabel } from './ui/Badge';
import Popover, { MenuItem } from './ui/Popover';
import { StatusIcon } from './ui/Badge';
import { STATUSES, isDone } from '../utils/constants';

/** Board card. The title is the button; "Move to" gives keyboard and touch users what drag-and-drop gives mouse users. */
function TaskCard({ task, onOpen, onMove, draggable = true, dragging = false, onDragStart, onDragEnd }) {
  return (
    <article className={`task-card ${dragging ? 'is-dragging' : ''} ${isDone(task) ? 'is-done' : ''}`} draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="task-card-top">
        <PriorityBadge priority={task.priority} />
        {onMove && (
          <Popover
            align="end"
            trigger={({ toggle, props }) => (
              <button type="button" className="icon-btn icon-btn-sm task-card-menu" aria-label={`Move "${task.title}"`} onClick={toggle} {...props}>
                <MoreHorizontal size={15} aria-hidden="true" />
              </button>
            )}
          >
            {({ close }) => (
              <>
                <p className="menu-label">Move to</p>
                {STATUSES.map((s) => (
                  <MenuItem
                    key={s.value}
                    selected={s.value === task.status}
                    onSelect={() => {
                      close();
                      if (s.value !== task.status) onMove(task, s.value);
                    }}
                  >
                    <span className="menu-status">
                      <StatusIcon status={s.value} /> {s.label}
                    </span>
                  </MenuItem>
                ))}
              </>
            )}
          </Popover>
        )}
      </div>
      <h3 className="task-card-title">
        <button type="button" onClick={() => onOpen(task._id)}>
          {task.title}
        </button>
      </h3>
      <footer className="task-card-foot">
        <DueLabel date={task.dueDate} done={isDone(task)} />
        <span className="task-card-meta">
          {task.commentCount > 0 && (
            <span className="task-card-comments num" aria-label={`${task.commentCount} ${task.commentCount === 1 ? 'comment' : 'comments'}`}>
              <MessageSquare size={13} aria-hidden="true" />
              {task.commentCount}
            </span>
          )}
          <Avatar user={task.assignedTo} size={22} />
        </span>
      </footer>
    </article>
  );
}

export default memo(TaskCard);
