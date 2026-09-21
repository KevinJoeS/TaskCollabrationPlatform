import { useResource } from '../lib/store';
import { taskService } from '../services/task';
import { commentService } from '../services/comment';

/** scope: 'mine' (assigned to me) or 'all' (every task in my projects). */
export const useTasks = (scope = 'all') => {
  const r = useResource(`tasks:${scope}`, () => taskService.list(scope === 'mine' ? { mine: true } : undefined));
  return { ...r, tasks: r.data };
};

export const useTask = (id) => {
  const r = useResource(id ? `task:${id}` : null, () => taskService.get(id));
  return { ...r, task: r.data };
};

export const useComments = (taskId) => {
  const r = useResource(taskId ? `comments:${taskId}` : null, () => commentService.list(taskId));
  return { ...r, comments: r.data };
};
