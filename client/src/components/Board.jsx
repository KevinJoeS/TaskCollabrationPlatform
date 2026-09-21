import { useCallback, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { StatusIcon } from './ui/Badge';
import { STATUSES, priorityRank } from '../utils/constants';

const sortCards = (a, b) => priorityRank(b.priority) - priorityRank(a.priority) || (a.dueDate && b.dueDate ? new Date(a.dueDate) - new Date(b.dueDate) : a.dueDate ? -1 : b.dueDate ? 1 : 0);

/** Five-column Kanban board with native drag and drop. Phones get snap-scrolling columns and the card's "Move to" menu. */
export default function Board({ tasks, onOpen, onMove, onAdd }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const columns = useMemo(() => STATUSES.map((s) => ({ ...s, tasks: tasks.filter((t) => t.status === s.value).sort(sortCards) })), [tasks]);

  const onDrop = useCallback(
    (status) => (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain') || dragId;
      const task = tasks.find((t) => t._id === id);
      setOverCol(null);
      setDragId(null);
      if (task && task.status !== status) onMove(task, status);
    },
    [tasks, dragId, onMove]
  );

  return (
    <div className={`board ${dragId ? 'is-dragging' : ''}`} role="list" aria-label="Task board">
      {columns.map((col) => (
        <section
          key={col.value}
          role="listitem"
          aria-label={`${col.label}, ${col.tasks.length} tasks`}
          className={`board-col ${overCol === col.value ? 'is-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (overCol !== col.value) setOverCol(col.value);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOverCol((c) => (c === col.value ? null : c));
          }}
          onDrop={onDrop(col.value)}
        >
          <header className="board-col-head">
            <StatusIcon status={col.value} size={15} />
            <h3>{col.label}</h3>
            <span className="board-col-count num">{col.tasks.length}</span>
            <button type="button" className="icon-btn icon-btn-sm board-col-add" onClick={() => onAdd(col.value)} aria-label={`Add task to ${col.label}`}>
              <Plus size={15} aria-hidden="true" />
            </button>
          </header>
          <div className="board-col-body">
            {col.tasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                onOpen={onOpen}
                onMove={onMove}
                dragging={dragId === t._id}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', t._id);
                  e.dataTransfer.effectAllowed = 'move';
                  // Let the browser snapshot the card before it is dimmed.
                  requestAnimationFrame(() => setDragId(t._id));
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setOverCol(null);
                }}
              />
            ))}
            {col.tasks.length === 0 && <p className="board-col-empty">{overCol === col.value ? 'Drop here' : 'No tasks'}</p>}
          </div>
        </section>
      ))}
    </div>
  );
}
