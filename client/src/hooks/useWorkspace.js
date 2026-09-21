import { useEffect } from 'react';
import { useResource } from '../lib/store';
import { activityService, notificationService } from '../services/workspace';

export const useActivity = ({ projectId, limit = 30 } = {}) => {
  const r = useResource(projectId ? `activity:${projectId}:${limit}` : `activity:all:${limit}`, () =>
    activityService.list({ project: projectId, limit })
  );
  return { ...r, activity: r.data };
};

export const useNotifications = () => {
  const r = useResource('notifications', notificationService.list);
  const { reload } = r;
  useEffect(() => {
    const id = window.setInterval(() => document.visibilityState === 'visible' && reload(), 60000);
    return () => window.clearInterval(id);
  }, [reload]);
  return { ...r, notifications: r.data?.notifications, unread: r.data?.unread || 0 };
};
