import api from './api';

export const projectService = {
  list: () => api.get('/projects').then((r) => r.data.projects),
  get: (id) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data) => api.post('/projects', data).then((r) => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then((r) => r.data.project),
  remove: (id) => api.delete(`/projects/${id}`).then((r) => r.data),
  addMember: (id, email) => api.post(`/projects/${id}/members`, { email }).then((r) => r.data.project),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then((r) => r.data.project),
};
