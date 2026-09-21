import api from './api';

export const activityService = {
  list: (params) => api.get('/activity', { params }).then((r) => r.data.activity),
};

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data.notification),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
};

export const searchService = {
  query: (q, signal) => api.get('/search', { params: { q }, signal }).then((r) => r.data),
};
