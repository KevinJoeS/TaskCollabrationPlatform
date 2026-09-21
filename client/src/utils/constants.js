// 'done' is the stored value for the Completed column (kept for compatibility with existing data).
export const STATUSES = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'in-review', label: 'In review' },
  { value: 'done', label: 'Completed' },
];

export const PRIORITIES = [
  { value: 'high', label: 'High', rank: 3 },
  { value: 'medium', label: 'Medium', rank: 2 },
  { value: 'low', label: 'Low', rank: 1 },
];

export const statusLabel = (v) => STATUSES.find((s) => s.value === v)?.label || v;
export const priorityLabel = (v) => PRIORITIES.find((p) => p.value === v)?.label || v;
export const statusRank = (v) => STATUSES.findIndex((s) => s.value === v);
export const priorityRank = (v) => PRIORITIES.find((p) => p.value === v)?.rank || 0;
export const isDone = (t) => t.status === 'done';
