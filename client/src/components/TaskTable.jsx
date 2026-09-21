import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown, Search, SearchX, X } from 'lucide-react';
import Avatar from './ui/Avatar';
import { StatusBadge, PriorityBadge, DueLabel } from './ui/Badge';
import { SelectControl } from './ui/Select';
import { EmptyState } from './ui/States';
import Button from './ui/Button';
import { STATUSES, PRIORITIES, statusRank, priorityRank, isDone } from '../utils/constants';
import { timeAgo } from '../utils/date';
import { useDebounce } from '../hooks/useUtilities';

const SORTERS = {
  title: (a, b) => a.title.localeCompare(b.title),
  project: (a, b) => (a.project?.name || '').localeCompare(b.project?.name || ''),
  status: (a, b) => statusRank(a.status) - statusRank(b.status),
  priority: (a, b) => priorityRank(a.priority) - priorityRank(b.priority),
  assignee: (a, b) => (a.assignedTo?.name || '\uffff').localeCompare(b.assignedTo?.name || '\uffff'),
  dueDate: (a, b, dir) => {
    // Finished work sinks below open work, then undated below dated.
    if (isDone(a) !== isDone(b)) return isDone(a) ? 1 : -1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return (new Date(a.dueDate) - new Date(b.dueDate)) * dir;
  },
  updatedAt: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
};

/**
 * Sortable, filterable task list. A real <table> on wide screens; each row becomes a card on phones.
 * showProject adds a Project column (used on My tasks).
 */
export default function TaskTable({ tasks, onOpen, showProject = false, showAssignee = true, defaultSort = { key: 'dueDate', dir: 1 }, emptyState }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sort, setSort] = useState(defaultSort);
  const q = useDebounce(query.trim().toLowerCase(), 150);

  const rows = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        (status === 'all' || (status === 'open' ? !isDone(t) : t.status === status)) &&
        (priority === 'all' || t.priority === priority) &&
        (!q || t.title.toLowerCase().includes(q) || (t.assignedTo?.name || '').toLowerCase().includes(q) || (t.project?.name || '').toLowerCase().includes(q))
    );
    const cmp = SORTERS[sort.key];
    return [...filtered].sort((a, b) => (sort.key === 'dueDate' ? cmp(a, b, sort.dir) : cmp(a, b) * sort.dir));
  }, [tasks, q, status, priority, sort]);

  const filtersActive = query || status !== 'all' || priority !== 'all';
  const clear = () => {
    setQuery('');
    setStatus('all');
    setPriority('all');
  };
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: key === 'priority' || key === 'updatedAt' ? -1 : 1 }));

  const columns = [
    { key: 'title', label: 'Task' },
    showProject && { key: 'project', label: 'Project' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    showAssignee && { key: 'assignee', label: 'Assignee' },
    { key: 'dueDate', label: 'Due date' },
    { key: 'updatedAt', label: 'Updated' },
  ].filter(Boolean);

  if (!tasks.length && emptyState) return <div className="panel">{emptyState}</div>;

  return (
    <div className="task-table-wrap">
      <div className="table-toolbar" role="search">
        <label className="search-field">
          <Search size={15} aria-hidden="true" />
          <span className="sr-only">Search tasks</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks" />
        </label>
        <SelectControl size="sm" aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="toolbar-select">
          <option value="all">All statuses</option>
          <option value="open">Open only</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectControl>
        <SelectControl size="sm" aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="toolbar-select">
          <option value="all">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </SelectControl>
        <SelectControl size="sm" aria-label="Sort tasks" className="toolbar-select toolbar-sort-mobile" value={`${sort.key}:${sort.dir}`} onChange={(e) => { const [key, dir] = e.target.value.split(':'); setSort({ key, dir: Number(dir) }); }}>
          <option value="dueDate:1">Sort: due soonest</option>
          <option value="priority:-1">Sort: highest priority</option>
          <option value="status:1">Sort: status</option>
          <option value="updatedAt:-1">Sort: recently updated</option>
          <option value="title:1">Sort: name</option>
        </SelectControl>
        <span className="table-count num" aria-live="polite">
          {rows.length} of {tasks.length}
        </span>
        {filtersActive && (
          <Button variant="ghost" size="sm" icon={X} onClick={clear}>
            Clear
          </Button>
        )}
      </div>

      <div className="panel table-panel">
        {rows.length === 0 ? (
          <EmptyState compact icon={SearchX} title="No tasks match these filters." body="Try a different search or clear the filters." action={<Button size="sm" onClick={clear}>Clear filters</Button>} />
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                {columns.map((c) => {
                  const active = sort.key === c.key;
                  const Icon = !active ? ChevronsUpDown : sort.dir === 1 ? ArrowUp : ArrowDown;
                  return (
                    <th key={c.key} scope="col" aria-sort={active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'} className={`col-${c.key}`}>
                      <button type="button" className={`th-btn ${active ? 'is-active' : ''}`} onClick={() => toggleSort(c.key)}>
                        {c.label}
                        <Icon size={12} aria-hidden="true" />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t._id} className={isDone(t) ? 'is-done' : ''}>
                  <td className="col-title" data-label="Task">
                    <button type="button" className="row-title" onClick={() => onOpen(t._id)}>
                      {t.title}
                    </button>
                  </td>
                  {showProject && (
                    <td className="col-project" data-label="Project">
                      <span className="truncate">{t.project?.name}</span>
                    </td>
                  )}
                  <td data-label="Status">
                    <StatusBadge status={t.status} />
                  </td>
                  <td data-label="Priority">
                    <PriorityBadge priority={t.priority} />
                  </td>
                  {showAssignee && (
                    <td data-label="Assignee">
                      <span className="cell-person">
                        <Avatar user={t.assignedTo} size={22} />
                        <span className="truncate">{t.assignedTo?.name || 'Unassigned'}</span>
                      </span>
                    </td>
                  )}
                  <td data-label="Due date">
                    <DueLabel date={t.dueDate} done={isDone(t)} icon={false} />
                  </td>
                  <td data-label="Updated" className="cell-muted num">
                    {timeAgo(t.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
