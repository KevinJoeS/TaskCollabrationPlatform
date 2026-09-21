import api from './api';

export const taskService = {
  list: (params) => api.get('/tasks', { params }).then((r) => r.data.tasks),
  get: (id) => api.get(`/tasks/${id}`).then((r) => r.data.task),
  create: (data) => api.post('/tasks', data).then((r) => r.data.task),
  update: (id, patch) => api.put(`/tasks/${id}`, patch).then((r) => r.data.task),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
};
