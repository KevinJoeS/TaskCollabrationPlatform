import api from './api';

export const commentService = {
  list: (taskId) => api.get(`/comments/task/${taskId}`).then((r) => r.data.comments),
  add: (taskId, content) => api.post(`/comments/task/${taskId}`, { content }).then((r) => r.data.comment),
  remove: (id) => api.delete(`/comments/${id}`).then((r) => r.data),
};
