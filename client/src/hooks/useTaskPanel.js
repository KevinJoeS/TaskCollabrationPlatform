import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** The task panel is driven by ?task=<id>, so an open task can be linked, reloaded and closed with Back. */
export function useTaskPanel() {
  const [params, setParams] = useSearchParams();
  const taskId = params.get('task');
  const openTask = useCallback(
    (id) =>
      setParams((p) => {
        const next = new URLSearchParams(p);
        next.set('task', id);
        return next;
      }),
    [setParams]
  );
  const closeTask = useCallback(
    () =>
      setParams(
        (p) => {
          const next = new URLSearchParams(p);
          next.delete('task');
          return next;
        },
        { replace: true }
      ),
    [setParams]
  );
  return { taskId, openTask, closeTask };
}
